import Collection from '../models/Collection.model';
import Farmer from '../models/Farmer.model';
import Collector from '../models/Collector.model';
import Payment from '../models/Payment.model';
import User from '../models/User.model';
import { Types } from 'mongoose';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateRange {
  start: Date;
  end: Date;
}

interface ProductionStats {
  totalWeight: number;
  totalRevenue: number;
  totalCollections: number;
  avgWeightPerCollection: number;
  gradeBreakdown: { grade1: number; grade2: number; grade3: number };
  statusBreakdown: { pending: number; verified: number; rejected: number; paid: number };
}

interface FraudFlag {
  type: 'duplicate_entry' | 'weight_spike' | 'suspicious_collector' | 'off_hours_collection';
  severity: 'low' | 'medium' | 'high';
  collectionId: string;
  description: string;
  collectorId?: string;
  farmerId?: string;
  detectedAt: Date;
  data: any;
}

// ─── Factory Service ──────────────────────────────────────────────────────────

class FactoryService {

  // ── Dashboard KPIs ──────────────────────────────────────────────────────────

  async getDashboardStats(): Promise<any> {
    const now = new Date();

    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      todayStats,
      weekStats,
      monthStats,
      lastMonthStats,
      activeFarmers,
      activeCollectors,
      pendingAudit,
      totalFarmers,
      totalCollectors,
      recentFraudFlags,
    ] = await Promise.all([
      this.getProductionStats({ start: todayStart, end: todayEnd }),
      this.getProductionStats({ start: weekStart, end: now }),
      this.getProductionStats({ start: monthStart, end: now }),
      this.getProductionStats({ start: lastMonthStart, end: lastMonthEnd }),
      Farmer.countDocuments({ status: 'active' }),
      Collector.countDocuments({ status: 'active' }),
      Collection.countDocuments({ status: 'pending' }),
      Farmer.countDocuments(),
      Collector.countDocuments(),
      this.detectFraud({ limit: 5 }),
    ]);

    const revenueGrowth = lastMonthStats.totalRevenue > 0
      ? (((monthStats.totalRevenue - lastMonthStats.totalRevenue) / lastMonthStats.totalRevenue) * 100).toFixed(1)
      : 0;
    const weightGrowth = lastMonthStats.totalWeight > 0
      ? (((monthStats.totalWeight - lastMonthStats.totalWeight) / lastMonthStats.totalWeight) * 100).toFixed(1)
      : 0;

    return {
      today: todayStats,
      week: weekStats,
      month: monthStats,
      growth: { revenue: revenueGrowth, weight: weightGrowth },
      activeFarmers,
      activeCollectors,
      totalFarmers,
      totalCollectors,
      pendingAudit,
      recentFraudFlags: recentFraudFlags.flags.slice(0, 5),
      fraudCount: recentFraudFlags.total,
    };
  }

  // ── Production Stats ────────────────────────────────────────────────────────

  async getProductionStats(range: DateRange): Promise<ProductionStats> {
    const query: any = {
      collectionDate: { $gte: range.start, $lte: range.end },
    };

    const [agg, statusCount, gradeCount] = await Promise.all([
      Collection.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalWeight:  { $sum: '$weight' },
            totalRevenue: { $sum: '$totalAmount' },
            count:        { $sum: 1 },
          },
        },
      ]),
      Collection.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Collection.aggregate([
        { $match: query },
        { $group: { _id: '$quality', totalWeight: { $sum: '$weight' } } },
      ]),
    ]);

    const raw = agg[0] || { totalWeight: 0, totalRevenue: 0, count: 0 };

    const statusBreakdown = { pending: 0, verified: 0, rejected: 0, paid: 0 };
    statusCount.forEach((s: any) => { (statusBreakdown as any)[s._id] = s.count; });

    const gradeBreakdown = { grade1: 0, grade2: 0, grade3: 0 };
    gradeCount.forEach((g: any) => { (gradeBreakdown as any)[g._id] = g.totalWeight; });

    return {
      totalWeight: raw.totalWeight,
      totalRevenue: raw.totalRevenue,
      totalCollections: raw.count,
      avgWeightPerCollection: raw.count > 0 ? raw.totalWeight / raw.count : 0,
      gradeBreakdown,
      statusBreakdown,
    };
  }

  // ── Production Trend ────────────────────────────────────────────────────────

  async getProductionTrend(days: number): Promise<any[]> {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const data = await Collection.aggregate([
      { $match: { collectionDate: { $gte: start } } },
      {
        $group: {
          _id: {
            year:  { $year: '$collectionDate' },
            month: { $month: '$collectionDate' },
            day:   { $dayOfMonth: '$collectionDate' },
          },
          totalWeight:  { $sum: '$weight' },
          totalRevenue: { $sum: '$totalAmount' },
          count:        { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return data.map((d: any) => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
      weight: d.totalWeight,
      revenue: d.totalRevenue,
      collections: d.count,
    }));
  }

  // ── Weekly Breakdown ────────────────────────────────────────────────────────

  async getWeeklyBreakdown(weeks: number): Promise<any[]> {
    const start = new Date();
    start.setDate(start.getDate() - weeks * 7);

    const data = await Collection.aggregate([
      { $match: { collectionDate: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: '$collectionDate' }, week: { $week: '$collectionDate' } },
          totalWeight:  { $sum: '$weight' },
          totalRevenue: { $sum: '$totalAmount' },
          count:        { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    return data.map((d: any) => ({
      week: `W${d._id.week}-${d._id.year}`,
      weight: d.totalWeight,
      revenue: d.totalRevenue,
      collections: d.count,
    }));
  }

  // ── Monthly Breakdown ───────────────────────────────────────────────────────

  async getMonthlyBreakdown(months: number): Promise<any[]> {
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const data = await Collection.aggregate([
      { $match: { collectionDate: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: '$collectionDate' }, month: { $month: '$collectionDate' } },
          totalWeight:  { $sum: '$weight' },
          totalRevenue: { $sum: '$totalAmount' },
          count:        { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return data.map((d: any) => ({
      month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
      weight: d.totalWeight,
      revenue: d.totalRevenue,
      collections: d.count,
    }));
  }

  // ── All Deliveries (paginated) ──────────────────────────────────────────────

  async getAllDeliveries(params: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    collectorId?: string;
    farmerId?: string;
    quality?: string;
  }): Promise<any> {
    const { page, limit, status, startDate, endDate, collectorId, farmerId, quality } = params;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status)      query.status  = status;
    if (quality)     query.quality = quality;
    if (collectorId) query.collector = new Types.ObjectId(collectorId);
    if (farmerId)    query.farmer   = new Types.ObjectId(farmerId);
    if (startDate || endDate) {
      query.collectionDate = {};
      if (startDate) query.collectionDate.$gte = new Date(startDate);
      if (endDate)   query.collectionDate.$lte = new Date(endDate);
    }

    const [collections, total] = await Promise.all([
      Collection.find(query)
        .populate({ path: 'farmer',    populate: { path: 'user', select: 'firstName lastName phone' } })
        .populate({ path: 'collector', populate: { path: 'user', select: 'firstName lastName phone' } })
        .populate('verifiedBy', 'firstName lastName')
        .sort({ collectionDate: -1 })
        .skip(skip)
        .limit(limit),
      Collection.countDocuments(query),
    ]);

    return { collections, total, page, pages: Math.ceil(total / limit) };
  }

  // ── Audit: approve or reject a collection ──────────────────────────────────

  async auditCollection(
    collectionId: string,
    action: 'verified' | 'rejected',
    auditorId: string,
    notes?: string,
  ): Promise<any> {
    const collection = await Collection.findById(collectionId);
    if (!collection) throw new Error('Collection not found');
    if (collection.status !== 'pending') throw new Error('Only pending collections can be audited');

    const updated = await Collection.findByIdAndUpdate(
      collectionId,
      {
        status: action,
        verifiedBy: auditorId,
        verificationDate: new Date(),
        notes,
      },
      { new: true, runValidators: true },
    )
      .populate({ path: 'farmer',    populate: { path: 'user', select: 'firstName lastName phone' } })
      .populate({ path: 'collector', populate: { path: 'user', select: 'firstName lastName phone' } });

    return updated;
  }

  // ── Bulk Audit ──────────────────────────────────────────────────────────────

  async bulkAudit(
    collectionIds: string[],
    action: 'verified' | 'rejected',
    auditorId: string,
    notes?: string,
  ): Promise<{ modified: number }> {
    const result = await Collection.updateMany(
      { _id: { $in: collectionIds }, status: 'pending' },
      {
        $set: {
          status: action,
          verifiedBy: auditorId,
          verificationDate: new Date(),
          notes,
        },
      },
    );
    return { modified: result.modifiedCount };
  }

  // ── Collector Performance ───────────────────────────────────────────────────

  async getCollectorPerformance(params: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { page, limit, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.collectionDate = {};
      if (startDate) dateFilter.collectionDate.$gte = new Date(startDate);
      if (endDate)   dateFilter.collectionDate.$lte = new Date(endDate);
    }

    const [performers, total] = await Promise.all([
      Collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$collector',
            totalCollections: { $sum: 1 },
            totalWeight:      { $sum: '$weight' },
            totalRevenue:     { $sum: '$totalAmount' },
            rejections:       { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            verifications:    { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
            avgWeight:        { $avg: '$weight' },
            uniqueFarmers:    { $addToSet: '$farmer' },
          },
        },
        {
          $project: {
            totalCollections: 1,
            totalWeight: 1,
            totalRevenue: 1,
            rejections: 1,
            verifications: 1,
            avgWeight: 1,
            farmerCount: { $size: '$uniqueFarmers' },
            rejectionRate: {
              $cond: [
                { $gt: ['$totalCollections', 0] },
                { $multiply: [{ $divide: ['$rejections', '$totalCollections'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { totalWeight: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$collector' } },
        { $count: 'total' },
      ]),
    ]);

    const populated = await Promise.all(
      performers.map(async (p: any) => {
        const collector = await Collector.findById(p._id)
          .populate('user', 'firstName lastName phone email');
        return { ...p, collector };
      }),
    );

    return {
      performers: populated,
      total: total[0]?.total || 0,
      page,
      pages: Math.ceil((total[0]?.total || 0) / limit),
    };
  }

  // ── Active Farmers Summary ──────────────────────────────────────────────────

  async getActiveFarmersSummary(params: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { page, limit, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.collectionDate = {};
      if (startDate) dateFilter.collectionDate.$gte = new Date(startDate);
      if (endDate)   dateFilter.collectionDate.$lte = new Date(endDate);
    }

    const [farmers, total] = await Promise.all([
      Collection.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$farmer',
            totalCollections: { $sum: 1 },
            totalWeight:      { $sum: '$weight' },
            totalRevenue:     { $sum: '$totalAmount' },
            lastCollection:   { $max: '$collectionDate' },
            avgWeight:        { $avg: '$weight' },
          },
        },
        { $sort: { totalWeight: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$farmer' } },
        { $count: 'total' },
      ]),
    ]);

    const populated = await Promise.all(
      farmers.map(async (f: any) => {
        const farmer = await Farmer.findById(f._id).populate('user', 'firstName lastName phone');
        return { ...f, farmer };
      }),
    );

    return {
      farmers: populated,
      total: total[0]?.total || 0,
      page,
      pages: Math.ceil((total[0]?.total || 0) / limit),
    };
  }

  // ── Fraud / Anomaly Detection ───────────────────────────────────────────────

  async detectFraud(params: { limit?: number; startDate?: string; endDate?: string } = {}): Promise<{
    flags: FraudFlag[];
    total: number;
    summary: { low: number; medium: number; high: number };
  }> {
    const { limit = 100, startDate, endDate } = params;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.collectionDate = {};
      if (startDate) dateFilter.collectionDate.$gte = new Date(startDate);
      if (endDate)   dateFilter.collectionDate.$lte = new Date(endDate);
    }

    const allFlags: FraudFlag[] = [];

    await Promise.all([
      this.detectDuplicateEntries(dateFilter, allFlags),
      this.detectWeightSpikes(dateFilter, allFlags),
      this.detectSuspiciousCollectors(dateFilter, allFlags),
      this.detectOffHoursCollections(dateFilter, allFlags),
    ]);

    const severityOrder = { high: 0, medium: 1, low: 2 };
    allFlags.sort((a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      b.detectedAt.getTime() - a.detectedAt.getTime(),
    );

    const summary = { low: 0, medium: 0, high: 0 };
    allFlags.forEach((f) => { summary[f.severity]++; });

    return {
      flags: allFlags.slice(0, limit),
      total: allFlags.length,
      summary,
    };
  }

  private async detectDuplicateEntries(dateFilter: any, flags: FraudFlag[]): Promise<void> {
    const recent = new Date(); recent.setDate(recent.getDate() - 30);
    const collections = await Collection.find({
      collectionDate: { $gte: recent },
      ...dateFilter,
    })
      .populate({ path: 'farmer',    select: 'farmerId' })
      .populate({ path: 'collector', select: 'collectorId' })
      .sort({ collectionDate: 1 });

    const seen = new Map<string, any>();
    collections.forEach((c: any) => {
      const dayKey = new Date(c.collectionDate).toISOString().slice(0, 10);
      const key = `${c.farmer?._id}-${c.collector?._id}-${dayKey}`;
      if (seen.has(key)) {
        const prev = seen.get(key);
        const weightDiff = Math.abs(c.weight - prev.weight);
        if (weightDiff <= 2) {
          flags.push({
            type: 'duplicate_entry',
            severity: 'high',
            collectionId: c._id.toString(),
            description: `Possible duplicate entry: same farmer & collector on ${dayKey}, weight diff ${weightDiff.toFixed(1)} kg`,
            collectorId: c.collector?._id?.toString(),
            farmerId:    c.farmer?._id?.toString(),
            detectedAt:  new Date(),
            data: { original: prev._id, duplicate: c._id, weightDiff },
          });
        }
      } else {
        seen.set(key, c);
      }
    });
  }

  private async detectWeightSpikes(dateFilter: any, flags: FraudFlag[]): Promise<void> {
    const recent = new Date(); recent.setDate(recent.getDate() - 60);

    const farmerAverages = await Collection.aggregate([
      { $match: { collectionDate: { $gte: recent }, status: { $ne: 'rejected' }, ...dateFilter } },
      {
        $group: {
          _id: '$farmer',
          avgWeight: { $avg: '$weight' },
          stdWeight: { $stdDevPop: '$weight' },
          count:     { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 3 } } },
    ]);

    const avgMap = new Map<string, any>(farmerAverages.map((f: any) => [f._id.toString(), f]));

    const recentCutoff = new Date(); recentCutoff.setDate(recentCutoff.getDate() - 14);
    const recentCollections = await Collection.find({
      collectionDate: { $gte: recentCutoff },
      ...dateFilter,
    }).populate({ path: 'farmer', select: 'farmerId' }).populate({ path: 'collector', select: 'collectorId' });

    recentCollections.forEach((c: any) => {
      const stats = avgMap.get(c.farmer?._id?.toString());
      if (!stats) return;
      const threshold = stats.avgWeight + 3 * (stats.stdWeight || stats.avgWeight * 0.5);
      if (c.weight > threshold && c.weight > stats.avgWeight * 2.5) {
        flags.push({
          type: 'weight_spike',
          severity: c.weight > stats.avgWeight * 4 ? 'high' : 'medium',
          collectionId: c._id.toString(),
          description: `Weight spike: ${c.weight} kg vs avg ${stats.avgWeight.toFixed(1)} kg (${((c.weight / stats.avgWeight) * 100 - 100).toFixed(0)}% above average)`,
          collectorId: c.collector?._id?.toString(),
          farmerId:    c.farmer?._id?.toString(),
          detectedAt:  new Date(),
          data: { recordedWeight: c.weight, farmerAvg: stats.avgWeight, multiplier: (c.weight / stats.avgWeight).toFixed(2) },
        });
      }
    });
  }

  private async detectSuspiciousCollectors(dateFilter: any, flags: FraudFlag[]): Promise<void> {
    const recent = new Date(); recent.setDate(recent.getDate() - 30);

    const collectorStats = await Collection.aggregate([
      { $match: { collectionDate: { $gte: recent }, ...dateFilter } },
      {
        $group: {
          _id: '$collector',
          total:       { $sum: 1 },
          rejected:    { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          totalWeight: { $sum: '$weight' },
          avgWeight:   { $avg: '$weight' },
        },
      },
      { $match: { total: { $gte: 5 } } },
    ]);

    collectorStats.forEach((s: any) => {
      const rejectionRate = (s.rejected / s.total) * 100;
      if (rejectionRate > 40) {
        flags.push({
          type: 'suspicious_collector',
          severity: rejectionRate > 60 ? 'high' : 'medium',
          collectionId: '',
          description: `High rejection rate: ${rejectionRate.toFixed(1)}% of ${s.total} collections rejected in last 30 days`,
          collectorId: s._id?.toString(),
          detectedAt:  new Date(),
          data: { total: s.total, rejected: s.rejected, rejectionRate: rejectionRate.toFixed(1) },
        });
      }
    });
  }

  private async detectOffHoursCollections(dateFilter: any, flags: FraudFlag[]): Promise<void> {
    const recent = new Date(); recent.setDate(recent.getDate() - 14);

    const collections = await Collection.find({
      collectionDate: { $gte: recent },
      ...dateFilter,
    })
      .populate({ path: 'farmer',    select: 'farmerId' })
      .populate({ path: 'collector', select: 'collectorId' });

    collections.forEach((c: any) => {
      const hour = new Date(c.collectionDate).getHours();
      if (hour >= 22 || hour < 5) {
        flags.push({
          type: 'off_hours_collection',
          severity: 'low',
          collectionId: c._id.toString(),
          description: `Collection recorded at ${String(hour).padStart(2, '0')}:00 (outside normal operating hours 05:00–22:00)`,
          collectorId: c.collector?._id?.toString(),
          farmerId:    c.farmer?._id?.toString(),
          detectedAt:  new Date(),
          data: { hour, collectionDate: c.collectionDate },
        });
      }
    });
  }

  // ── Revenue Forecasting ─────────────────────────────────────────────────────

  async getRevenueForecast(days: number): Promise<any> {
    const historyStart = new Date();
    historyStart.setDate(historyStart.getDate() - 90);

    const historical = await Collection.aggregate([
      { $match: { collectionDate: { $gte: historyStart }, status: { $ne: 'rejected' } } },
      {
        $group: {
          _id: {
            year:  { $year: '$collectionDate' },
            month: { $month: '$collectionDate' },
            day:   { $dayOfMonth: '$collectionDate' },
          },
          revenue: { $sum: '$totalAmount' },
          weight:  { $sum: '$weight' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const n = historical.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    historical.forEach((d: any, i: number) => {
      sumX  += i;
      sumY  += d.revenue;
      sumXY += i * d.revenue;
      sumX2 += i * i;
    });

    const slope     = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

    const monthFactors: Record<number, number> = {
      1: 0.85, 2: 0.90, 3: 1.10, 4: 1.20, 5: 1.15, 6: 1.00,
      7: 0.95, 8: 0.90, 9: 1.05, 10: 1.15, 11: 1.10, 12: 0.90,
    };

    const forecast = [];
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      const month    = forecastDate.getMonth() + 1;
      const seasonal = monthFactors[month] || 1.0;
      const baseRevenue       = Math.max(0, intercept + slope * (n + i));
      const forecastedRevenue = baseRevenue * seasonal;
      const confidence        = Math.max(0.5, 0.95 - i * 0.005);

      forecast.push({
        date:       forecastDate.toISOString().slice(0, 10),
        revenue:    Math.round(forecastedRevenue),
        weight:     Math.round(forecastedRevenue / 22),
        confidence: parseFloat(confidence.toFixed(3)),
        lower:      Math.round(forecastedRevenue * 0.85),
        upper:      Math.round(forecastedRevenue * 1.15),
      });
    }

    const totalForecast  = forecast.reduce((s, d) => s + d.revenue, 0);
    const recentRevenue  = historical.slice(-30).reduce((s: number, d: any) => s + d.revenue, 0);

    return {
      forecast,
      summary: {
        forecastedRevenue:    totalForecast,
        recentActualRevenue:  recentRevenue,
        forecastPeriodDays:   days,
        avgConfidence:        (forecast.reduce((s, d) => s + d.confidence, 0) / forecast.length).toFixed(3),
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      },
      historical: historical.map((d: any) => ({
        date:    `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
        revenue: d.revenue,
        weight:  d.weight,
      })),
    };
  }

  // ── Factory Output Forecast ─────────────────────────────────────────────────

  async getOutputForecast(days: number): Promise<any> {
    const historyStart = new Date();
    historyStart.setDate(historyStart.getDate() - 90);

    const historical = await Collection.aggregate([
      { $match: { collectionDate: { $gte: historyStart }, status: { $ne: 'rejected' } } },
      {
        $group: {
          _id: {
            year:  { $year: '$collectionDate' },
            month: { $month: '$collectionDate' },
            day:   { $dayOfMonth: '$collectionDate' },
          },
          totalWeight: { $sum: '$weight' },
          grade1: { $sum: { $cond: [{ $eq: ['$quality', 'grade1'] }, '$weight', 0] } },
          grade2: { $sum: { $cond: [{ $eq: ['$quality', 'grade2'] }, '$weight', 0] } },
          grade3: { $sum: { $cond: [{ $eq: ['$quality', 'grade3'] }, '$weight', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const n = historical.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    historical.forEach((d: any, i: number) => {
      sumX  += i;
      sumY  += d.totalWeight;
      sumXY += i * d.totalWeight;
      sumX2 += i * i;
    });

    const slope     = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

    const processingRatio = 4.5;

    const forecast = [];
    for (let i = 1; i <= days; i++) {
      const date    = new Date();
      date.setDate(date.getDate() + i);
      const rawLeaf = Math.max(0, intercept + slope * (n + i));
      const madeTea = rawLeaf / processingRatio;

      forecast.push({
        date:       date.toISOString().slice(0, 10),
        rawLeaf:    Math.round(rawLeaf),
        madeTea:    Math.round(madeTea),
        confidence: Math.max(0.5, 0.92 - i * 0.004),
      });
    }

    return {
      forecast,
      summary: {
        forecastedRawLeaf: forecast.reduce((s, d) => s + d.rawLeaf, 0),
        forecastedMadeTea: forecast.reduce((s, d) => s + d.madeTea, 0),
        processingRatio,
        forecastPeriodDays: days,
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      },
    };
  }

  // ── Report Data ─────────────────────────────────────────────────────────────

  // ── Report Data ─────────────────────────────────────────────────────────────

  async getReportData(params: {
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { reportType, startDate, endDate } = params;
    let start: Date, end: Date;

    const now = new Date();
    if (reportType === 'daily') {
      start = new Date(now); start.setHours(0, 0, 0, 0);
      end   = new Date(now); end.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      start = new Date(now); start.setDate(now.getDate() - 7);
      end   = now;
    } else if (reportType === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = now;
    } else {
      start = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - 30));
      end   = endDate   ? new Date(endDate)   : new Date();
    }

    const [production, collectorPerf, byGrade, byLocation] = await Promise.all([
      this.getProductionStats({ start, end }),
      this.getCollectorPerformance({ page: 1, limit: 50, startDate: start.toISOString(), endDate: end.toISOString() }),
      Collection.aggregate([
        { $match: { collectionDate: { $gte: start, $lte: end } } },
        { $group: { _id: '$quality', weight: { $sum: '$weight' }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Collection.aggregate([
        { $match: { collectionDate: { $gte: start, $lte: end } } },
        {
          $lookup: {
            from: 'farmers',
            localField: 'farmer',
            foreignField: '_id',
            as: 'farmerData',
          },
        },
        // FIXED TYPO ON THE LINE BELOW: preserveNullAndEmpty -> preserveNullAndEmptyArrays
        { $unwind: { path: '$farmerData', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$farmerData.location.county',
            weight:  { $sum: '$weight' },
            revenue: { $sum: '$totalAmount' },
            count:   { $sum: 1 },
          },
        },
        { $sort: { weight: -1 } },
      ]),
    ]);

    return {
      period: { start, end, type: reportType },
      production,
      collectorPerformance: collectorPerf.performers,
      gradeBreakdown:       byGrade,
      locationBreakdown:    byLocation,
      generatedAt:          new Date(),
    };
  }

  // ── System Stats ────────────────────────────────────────────────────────────

  async getSystemStats(): Promise<any> {
    const [totalFarmers, activeFarmers, totalCollectors, activeCollectors,
           totalCollections, pendingPayments] = await Promise.all([
      Farmer.countDocuments(),
      Farmer.countDocuments({ status: 'active' }),
      Collector.countDocuments(),
      Collector.countDocuments({ status: 'active' }),
      Collection.countDocuments(),
      Payment.countDocuments({ status: 'pending' }),
    ]);

    const [totalRevenueAgg, monthlyRevenueAgg] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            paymentDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalFarmers,
      activeFarmers,
      totalCollectors,
      activeCollectors,
      totalCollections,
      pendingPayments,
      totalRevenue:   totalRevenueAgg[0]?.total  || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    };
  }
}

export default new FactoryService();