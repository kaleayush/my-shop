'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon, CheckIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SimpleEntity } from '../types'

interface Props {
  label: string
  service: {
    getAll: () => Promise<SimpleEntity[]>
    create: (name: string) => Promise<SimpleEntity>
    update: (id: string, name: string) => Promise<SimpleEntity>
    delete: (id: string) => Promise<void>
  }
}

export function SimpleEntityManager({ label, service }: Props) {
  const [items, setItems] = useState<SimpleEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await service.getAll()) } finally { setLoading(false) }
  }, [service])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const created = await service.create(newName.trim())
      setItems(prev => [...prev, created])
      setNewName('')
      setAdding(false)
    } finally { setSaving(false) }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const updated = await service.update(id, editName.trim())
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      setEditId(null)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Deactivate this ${label.toLowerCase()}?`)) return
    await service.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const startEdit = (item: SimpleEntity) => {
    setEditId(item.id)
    setEditName(item.name)
    setAdding(false)
  }

  if (loading) return <p className="text-sm text-muted-foreground py-2">Loading...</p>

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{items.length} {label.toLowerCase()}(s)</p>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => { setAdding(true); setEditId(null) }}>
            <PlusIcon className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder={`${label} name`}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setAdding(false) }}
            className="h-8 text-sm"
          />
          <Button size="icon-sm" onClick={handleCreate} disabled={saving || !newName.trim()}>
            <CheckIcon className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => { setAdding(false); setNewName('') }}>
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {items.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground py-1">No {label.toLowerCase()}s yet.</p>
      ) : (
        <ul className="space-y-1">
          {items.map(item => (
            <li key={item.id} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40 group">
              {editId === item.id ? (
                <>
                  <Input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(item.id); if (e.key === 'Escape') setEditId(null) }}
                    className="h-7 text-sm flex-1"
                  />
                  <Button size="icon-sm" onClick={() => handleUpdate(item.id)} disabled={saving}>
                    <CheckIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => setEditId(null)}>
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{item.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon-sm" variant="ghost" onClick={() => startEdit(item)}>
                      <PencilIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
