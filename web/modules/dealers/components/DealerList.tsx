'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DealerSheet } from './DealerSheet'
import { dealerService } from '../services/dealerService'
import type { Dealer } from '../types'

export function DealerList() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Dealer | undefined>()
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setDealers(await dealerService.getAll())
    } catch {
      setError('Failed to load dealers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = () => {
    setEditing(undefined)
    setSheetOpen(true)
  }

  const handleEdit = (dealer: Dealer) => {
    setEditing(dealer)
    setSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this dealer?')) return
    await dealerService.delete(id)
    setDealers(prev => prev.filter(d => d.id !== id))
  }

  const handleSubmit = async (values: { name: string; phone?: string; address?: string; notes?: string }) => {
    if (editing) {
      const updated = await dealerService.update(editing.id, values)
      setDealers(prev => prev.map(d => d.id === updated.id ? updated : d))
    } else {
      const created = await dealerService.create(values)
      setDealers(prev => [...prev, created])
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dealers</h1>
          <p className="text-sm text-muted-foreground">Manage your suppliers and dealers</p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Dealer
        </Button>
      </div>

      {dealers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No dealers yet. Add one to get started.</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Phone</th>
                <th className="text-left px-4 py-2 font-medium">Address</th>
                <th className="w-20 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {dealers.map(dealer => (
                <tr key={dealer.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium">{dealer.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{dealer.phone ?? '—'}</td>
                  <td className="px-4 py-2 text-muted-foreground">{dealer.address ?? '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(dealer)}>
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(dealer.id)}>
                        <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DealerSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        dealer={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
