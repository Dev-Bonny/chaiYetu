'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, RefreshCw, FileSpreadsheet, Printer } from 'lucide-react'
import { factoryService } from '@/lib/factory-service'
import { formatCurrency, formatWeight, formatDate } from '@/lib/utils'

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom'

function downloadCSV(data: any[][], filename: string) {
  const csv  = data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function printReport(reportData: any, reportType: ReportType) {
  const p = reportData.production
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ChaiYetu Factory Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
    h1 { color: #4a834a; margin-bottom: 4px; }
    h2 { color: #4a834a; font-size: 16px; margin-top: 24px; }
    .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
    .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
    .stat { background: #f7faf7; border: 1px solid #d4e8d4; padding: 12px; border-radius: 8px; }
    .stat .val { font-size: 20px; font-weight: bold; color: #2d7d2d; }
    .stat .lbl { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f0f9f0; padding: 8px 12px; text-align: left; border-bottom: 2px solid #b2d5b2; }
    td { padding: 7px 12px; border-bottom: 1px solid #eee; }
    .footer { margin-top: 32px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
  </style>
</head>
<body>
  <h1>ChaiYetu — Factory Report</h1>
  <p class="meta">Type: ${reportType.toUpperCase()} | Period: ${formatDate(reportData.period?.start)} – ${formatDate(reportData.period?.end)} | Generated: ${new Date().toLocaleString('en-KE')}</p>
  <h2>Production Summary</h2>
  <div class="stats">
    <div class="stat"><div class="val">${p?.totalCollections ?? 0}</div><div class="lbl">Collections</div></div>
    <div class="stat"><div class="val">${formatWeight(p?.totalWeight ?? 0)}</div><div class="lbl">Total Weight</div></div>
    <div class="stat"><div class="val">${formatCurrency(p?.totalRevenue ?? 0)}</div><div class="lbl">Total Revenue</div></div>
    <div class="stat"><div class="val">${formatWeight(p?.avgWeightPerCollection ?? 0)}</div><div class="lbl">Avg per Collection</div></div>
  </div>
  <h2>Collector Performance</h2>
  <table>
    <thead><tr><th>Collector</th><th>Collections</th><th>Weight</th><th>Revenue</th><th>Rejection Rate</th></tr></thead>
    <tbody>
      ${(reportData.collectorPerformance || []).slice(0, 20).map((c: any) =>
        `<tr>
          <td>${c.collector?.user?.firstName || ''} ${c.collector?.user?.lastName || ''}</td>
          <td>${c.totalCollections}</td>
          <td>${formatWeight(c.totalWeight)}</td>
          <td>${formatCurrency(c.totalRevenue)}</td>
          <td>${parseFloat(c.rejectionRate || 0).toFixed(1)}%</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>
  <h2>By Grade</h2>
  <table>
    <thead><tr><th>Grade</th><th>Collections</th><th>Weight</th><th>Revenue</th></tr></thead>
    <tbody>
      ${(reportData.gradeBreakdown || []).map((g: any) =>
        `<tr><td>${g._id}</td><td>${g.count}</td><td>${formatWeight(g.weight)}</td><td>${formatCurrency(g.revenue)}</td></tr>`
      ).join('')}
    </tbody>
  </table>
  <h2>By Location</h2>
  <table>
    <thead><tr><th>County</th><th>Collections</th><th>Weight</th><th>Revenue</th></tr></thead>
    <tbody>
      ${(reportData.locationBreakdown || []).map((l: any) =>
        `<tr><td>${l._id || 'Unknown'}</td><td>${l.count}</td><td>${formatWeight(l.weight)}</td><td>${formatCurrency(l.revenue)}</td></tr>`
      ).join('')}
    </tbody>
  </table>
  <div class="footer">ChaiYetu Tea Management System • Confidential</div>
</body>
</html>`
  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close(); win.print() }
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('monthly')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading]   = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await factoryService.getReportData({
        reportType,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      })
      setReportData(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [reportType])

  const handleExportCSV = () => {
    if (!reportData) return
    const p = reportData.production
    const rows: any[][] = [
      ['ChaiYetu Factory Report'],
      ['Period', `${formatDate(reportData.period?.start)} - ${formatDate(reportData.period?.end)}`],
      ['Report Type', reportType.toUpperCase()],
      ['Generated', new Date().toLocaleString('en-KE')],
      [],
      ['PRODUCTION SUMMARY'],
      ['Total Collections', p?.totalCollections ?? 0],
      ['Total Weight (kg)', p?.totalWeight ?? 0],
      ['Total Revenue (KES)', p?.totalRevenue ?? 0],
      ['Avg Weight/Collection (kg)', (p?.avgWeightPerCollection ?? 0).toFixed(2)],
      ['Verified', p?.statusBreakdown?.verified ?? 0],
      ['Rejected', p?.statusBreakdown?.rejected ?? 0],
      [],
      ['COLLECTOR PERFORMANCE'],
      ['Collector Name', 'Collector ID', 'Collections', 'Weight (kg)', 'Revenue (KES)', 'Rejection Rate (%)'],
      ...(reportData.collectorPerformance || []).map((c: any) => [
        `${c.collector?.user?.firstName || ''} ${c.collector?.user?.lastName || ''}`,
        c.collector?.collectorId || '',
        c.totalCollections,
        c.totalWeight,
        c.totalRevenue,
        parseFloat(c.rejectionRate || 0).toFixed(1),
      ]),
      [],
      ['GRADE BREAKDOWN'],
      ['Grade', 'Collections', 'Weight (kg)', 'Revenue (KES)'],
      ...(reportData.gradeBreakdown || []).map((g: any) => [g._id, g.count, g.weight, g.revenue]),
      [],
      ['LOCATION BREAKDOWN'],
      ['County', 'Collections', 'Weight (kg)', 'Revenue (KES)'],
      ...(reportData.locationBreakdown || []).map((l: any) => [l._id || 'Unknown', l.count, l.weight, l.revenue]),
    ]
    downloadCSV(rows, `chaiyetu-factory-report-${reportType}-${new Date().toISOString().slice(0,10)}.csv`)
  }

  const p = reportData?.production

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-gray-600" size={26} />
            Factory Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">Generate and export factory reports in multiple formats</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} disabled={!reportData}
            className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40">
            <FileSpreadsheet size={15} /> Export CSV
          </button>
          <button onClick={() => reportData && printReport(reportData, reportType)} disabled={!reportData}
            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40">
            <Printer size={15} /> Print / PDF
          </button>
        </div>
      </div>

      <div className="card !p-4 flex gap-3 flex-wrap items-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['daily','weekly','monthly','custom'] as const).map(t => (
            <button key={t} onClick={() => setReportType(t)}
              className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                reportType === t ? 'bg-tea-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}>{t}</button>
          ))}
        </div>
        {reportType === 'custom' && (
          <>
            <input type="date" className="input-field w-40 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="text-gray-400">—</span>
            <input type="date" className="input-field w-40 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </>
        )}
        <button onClick={load} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={15} /> Generate
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tea-500" />
        </div>
      ) : reportData && (
        <div className="space-y-6">
          <div className="bg-tea-50 border border-tea-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-tea-800">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
              <p className="text-sm text-tea-700">{formatDate(reportData.period?.start)} — {formatDate(reportData.period?.end)}</p>
            </div>
            <p className="text-xs text-tea-600">Generated: {new Date().toLocaleString('en-KE')}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Production Summary</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Collections', value: p?.totalCollections ?? 0 },
                { label: 'Total Weight',       value: formatWeight(p?.totalWeight ?? 0) },
                { label: 'Total Revenue',      value: formatCurrency(p?.totalRevenue ?? 0) },
                { label: 'Avg Weight',         value: formatWeight(p?.avgWeightPerCollection ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="card !p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Grade Breakdown</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {['Grade','Collections','Weight','Revenue'].map(h => (
                    <th key={h} className="pb-2 text-left font-medium text-gray-500">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(reportData.gradeBreakdown || []).map((g: any) => (
                    <tr key={g._id}>
                      <td className="py-2 capitalize font-medium">{g._id?.replace('grade', 'Grade ')}</td>
                      <td className="py-2">{g.count}</td>
                      <td className="py-2">{formatWeight(g.weight)}</td>
                      <td className="py-2 text-green-700">{formatCurrency(g.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">By County</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {['County','Collections','Weight','Revenue'].map(h => (
                    <th key={h} className="pb-2 text-left font-medium text-gray-500">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(reportData.locationBreakdown || []).slice(0, 8).map((l: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 font-medium">{l._id || 'Unknown'}</td>
                      <td className="py-2">{l.count}</td>
                      <td className="py-2">{formatWeight(l.weight)}</td>
                      <td className="py-2 text-green-700">{formatCurrency(l.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">Collector Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Rank','Collector','Collections','Weight','Revenue','Farmers Served','Rejection Rate'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(reportData.collectorPerformance || []).map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{c.collector?.user?.firstName} {c.collector?.user?.lastName}</td>
                      <td className="px-4 py-2.5">{c.totalCollections}</td>
                      <td className="px-4 py-2.5">{formatWeight(c.totalWeight)}</td>
                      <td className="px-4 py-2.5 text-green-700">{formatCurrency(c.totalRevenue)}</td>
                      <td className="px-4 py-2.5">{c.farmerCount}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium ${
                          parseFloat(c.rejectionRate||0) > 40 ? 'text-red-600' :
                          parseFloat(c.rejectionRate||0) > 20 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {parseFloat(c.rejectionRate || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}