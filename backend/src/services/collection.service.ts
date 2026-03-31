import Collection, { ICollection } from '../models/Collection.model';
import Farmer from '../models/Farmer.model';
import Collector from '../models/Collector.model';
import { Types } from 'mongoose';
import notificationService from './notification.service';

interface GetCollectionsParams {
  userRole: string;
  userId: string;
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

class CollectionService {
  async createCollection(collectionData: any): Promise<ICollection> {
    // Verify farmer exists and is active
    const farmer = await Farmer.findOne({
      _id: collectionData.farmer,
      status: 'active'
    }).populate('user');

    if (!farmer) {
      throw new Error('Farmer not found or inactive');
    }

    // Verify collector exists and is active
    const collector = await Collector.findOne({
      user: collectionData.collector,
      status: 'active'
    });

    if (!collector) {
      throw new Error('Collector not found or inactive');
    }

    // Set price based on quality
    const priceMap = { grade1: 25, grade2: 20, grade3: 15 }; // Prices in KES per kg
    collectionData.pricePerKg = priceMap[collectionData.quality as keyof typeof priceMap];

    // Calculate total amount
    collectionData.totalAmount = collectionData.weight * collectionData.pricePerKg;

    // Use collector profile ID instead of user ID
    collectionData.collector = collector._id;

    const collection = await Collection.create(collectionData);

    // Update collector stats
    await Collector.findByIdAndUpdate(collector._id, {
      $inc: { totalCollections: 1 }
    });

    // Notify Farmer
    try {
      await notificationService.createCollectionNotification(farmer.user._id.toString(), {
        _id: collection._id,
        weight: collection.weight,
        status: collection.status,
        quality: collection.quality,
        collectionDate: collection.collectionDate
      });
    } catch (notifError) {
      console.error('Failed to send collection notification:', notifError);
      // Don't fail the request if notification fails
    }

    return collection;
  }

  async getCollections(params: GetCollectionsParams): Promise<{ collections: ICollection[]; total: number; page: number; pages: number }> {
    const { userRole, userId, page, limit, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Role-based filtering
    if (userRole === 'farmer') {
      const farmer = await Farmer.findOne({ user: userId });
      if (!farmer) throw new Error('Farmer profile not found');
      query.farmer = farmer._id;
    } else if (userRole === 'collector') {
      const collector = await Collector.findOne({ user: userId });
      if (!collector) throw new Error('Collector profile not found');
      query.collector = collector._id;
    }

    if (status) query.status = status;

    if (startDate || endDate) {
      query.collectionDate = {};
      if (startDate) query.collectionDate.$gte = new Date(startDate);
      if (endDate) query.collectionDate.$lte = new Date(endDate);
    }

    const [collections, total] = await Promise.all([
      Collection.find(query)
        .populate('farmer')
        .populate('collector')
        .populate('verifiedBy')
        .sort({ collectionDate: -1 })
        .skip(skip)
        .limit(limit),
      Collection.countDocuments(query)
    ]);

    return {
      collections,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getCollectionById(collectionId: string): Promise<ICollection> {
    const collection = await Collection.findById(collectionId)
      .populate('farmer')
      .populate('collector')
      .populate('verifiedBy');

    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  async updateCollection(collectionId: string, updateData: any): Promise<ICollection> {
    // Prevent updating verified collections
    const existingCollection = await Collection.findById(collectionId);
    if (!existingCollection) {
      throw new Error('Collection not found');
    }

    if (existingCollection.status !== 'pending') {
      throw new Error('Cannot update verified collection');
    }

    // Recalculate total amount if weight or quality changes
    if (updateData.weight || updateData.quality) {
      const priceMap = { grade1: 25, grade2: 20, grade3: 15 };
      const quality = updateData.quality || existingCollection.quality;
      const weight = updateData.weight || existingCollection.weight;
      updateData.pricePerKg = priceMap[quality as keyof typeof priceMap];
      updateData.totalAmount = weight * updateData.pricePerKg;
    }

    const collection = await Collection.findByIdAndUpdate(
      collectionId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('farmer').populate('collector');

    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  async verifyCollection(collectionId: string, status: string, verifiedBy: string, notes?: string): Promise<ICollection> {
    const collection = await Collection.findByIdAndUpdate(
      collectionId,
      {
        status,
        verifiedBy,
        verificationDate: new Date(),
        notes
      },
      { new: true, runValidators: true }
    ).populate('farmer').populate('collector');

    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  async getFarmerCollections(farmerId: string, page: number, limit: number): Promise<{ collections: ICollection[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      Collection.find({ farmer: farmerId })
        .populate('collector')
        .populate('verifiedBy')
        .sort({ collectionDate: -1 })
        .skip(skip)
        .limit(limit),
      Collection.countDocuments({ farmer: farmerId })
    ]);

    return {
      collections,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getCollectorCollections(collectorId: string, page: number, limit: number): Promise<{ collections: ICollection[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      Collection.find({ collector: collectorId })
        .populate('farmer')
        .populate('verifiedBy')
        .sort({ collectionDate: -1 })
        .skip(skip)
        .limit(limit),
      Collection.countDocuments({ collector: collectorId })
    ]);

    return {
      collections,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getCollectionSummary(userRole: string, userId: string): Promise<any> {
    const query: any = {};

    if (userRole === 'farmer') {
      const farmer = await Farmer.findOne({ user: userId });
      if (farmer) query.farmer = farmer._id;
    } else if (userRole === 'collector') {
      const collector = await Collector.findOne({ user: userId });
      if (collector) query.collector = collector._id;
    }

    const [totalCollections, totalWeight, totalValue, pendingVerification] = await Promise.all([
      Collection.countDocuments(query),
      Collection.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      Collection.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Collection.countDocuments({ ...query, status: 'pending' })
    ]);

    return {
      totalCollections,
      totalWeight: totalWeight[0]?.total || 0,
      totalValue: totalValue[0]?.total || 0,
      pendingVerification
    };
  }
}

export default new CollectionService();