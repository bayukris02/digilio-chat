'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, RefreshCcw, Search, Table as TableIcon } from 'lucide-react'

interface POData {
  id: string;
  vendor_name: string;
  item_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function DynamicTable() {
  const [data, setData] = useState<POData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // tenant_id is hardcoded for now until Phase 5
      const response = await fetch('http://localhost:9005/api/purchase-orders?tenant_id=client_demo_001')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
          <TableIcon size={18} className="text-blue-600" />
          Purchase Order Records
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading your records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 p-4">
            <p className="font-bold">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p>No records found. Try creating a PO via chat.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-3 border-b">ID</th>
                <th className="px-6 py-3 border-b">Vendor</th>
                <th className="px-6 py-3 border-b">Product</th>
                <th className="px-6 py-3 border-b text-right">Qty</th>
                <th className="px-6 py-3 border-b text-right">Amount</th>
                <th className="px-6 py-3 border-b">Status</th>
                <th className="px-6 py-3 border-b">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((po) => (
                <tr key={po.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-[11px] text-gray-400">#{po.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{po.vendor_name}</td>
                  <td className="px-6 py-4 text-gray-600">{po.item_name}</td>
                  <td className="px-6 py-4 text-right font-medium">{po.quantity}</td>
                  <td className="px-6 py-4 text-right font-semibold text-blue-600">
                    Rp {po.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(po.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
