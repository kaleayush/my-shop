import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDealers } from '../../store/slices/dealerSlice'
import { searchProducts } from '../../store/slices/productSlice'
import { fetchInventory } from '../../store/slices/inventorySlice'
import CardDataStats from '../../components/CardDataStats'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { data: dealers } = useSelector((s) => s.dealers)
  const { data: products } = useSelector((s) => s.products)
  const { data: inventory } = useSelector((s) => s.inventory)
  const { user } = useSelector((s) => s.auth)

  useEffect(() => {
    dispatch(fetchDealers())
    dispatch(searchProducts({}))
    dispatch(fetchInventory())
  }, [dispatch])

  const lowStockCount = inventory.filter((b) => b.isLowStock).length
  const totalStock = inventory.reduce((sum, b) => sum + (b.availableQuantity ?? 0), 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{user?.shopName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardDataStats
          title="Total Products"
          value={products.length}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <CardDataStats
          title="Active Dealers"
          value={dealers.filter((d) => d.isActive).length}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <CardDataStats
          title="Available Stock"
          value={totalStock.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <CardDataStats
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'Needs reorder' : 'All good'}
          trendUp={lowStockCount === 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Low Stock Items</h3>
          <div className="space-y-1">
            {inventory.filter((b) => b.isLowStock).slice(0, 5).map((b) => (
              <div key={b.id} className="flex justify-between text-sm text-amber-700">
                <span>{b.productName} ({b.dealerName})</span>
                <span className="font-medium">{b.availableQuantity} remaining</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
