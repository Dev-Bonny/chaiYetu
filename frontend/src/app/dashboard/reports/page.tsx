'use client'

import { FileText, Download, Calendar } from 'lucide-react'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
                    <p className="text-gray-600">View and download daily collection reports</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Calendar size={18} />
                        <span>Select Date</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Reports Available</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                    There are no reports generated for the selected period. Try selecting a different date range.
                </p>
            </div>
        </div>
    )
}
