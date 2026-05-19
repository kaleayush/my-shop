'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon, CheckIcon, XIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { bikeCompanyService, bikeModelService } from '../services/settingsService'
import type { SimpleEntity, BikeModel } from '../types'

export function BikeModelManager() {
  const [companies, setCompanies] = useState<SimpleEntity[]>([])
  const [models, setModels] = useState<BikeModel[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [addingCompany, setAddingCompany] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [addingModelFor, setAddingModelFor] = useState<string | null>(null)
  const [newModelName, setNewModelName] = useState('')
  const [editCompanyId, setEditCompanyId] = useState<string | null>(null)
  const [editCompanyName, setEditCompanyName] = useState('')
  const [editModelId, setEditModelId] = useState<string | null>(null)
  const [editModelName, setEditModelName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, m] = await Promise.all([bikeCompanyService.getAll(), bikeModelService.getAll()])
      setCompanies(c)
      setModels(m)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return
    setSaving(true)
    try {
      const created = await bikeCompanyService.create(newCompanyName.trim())
      setCompanies(prev => [...prev, created])
      setNewCompanyName('')
      setAddingCompany(false)
    } finally { setSaving(false) }
  }

  const handleUpdateCompany = async (id: string) => {
    if (!editCompanyName.trim()) return
    setSaving(true)
    try {
      const updated = await bikeCompanyService.update(id, editCompanyName.trim())
      setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
      setEditCompanyId(null)
    } finally { setSaving(false) }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Deactivate this bike company? Its models will also be deactivated.')) return
    await bikeCompanyService.delete(id)
    setCompanies(prev => prev.filter(c => c.id !== id))
    setModels(prev => prev.filter(m => m.bikeCompanyId !== id))
  }

  const handleAddModel = async (companyId: string) => {
    if (!newModelName.trim()) return
    setSaving(true)
    try {
      const created = await bikeModelService.create(companyId, newModelName.trim())
      setModels(prev => [...prev, created])
      setNewModelName('')
      setAddingModelFor(null)
    } finally { setSaving(false) }
  }

  const handleUpdateModel = async (id: string) => {
    if (!editModelName.trim()) return
    setSaving(true)
    try {
      const updated = await bikeModelService.update(id, editModelName.trim())
      setModels(prev => prev.map(m => m.id === updated.id ? updated : m))
      setEditModelId(null)
    } finally { setSaving(false) }
  }

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Deactivate this bike model?')) return
    await bikeModelService.delete(id)
    setModels(prev => prev.filter(m => m.id !== id))
  }

  if (loading) return <p className="text-sm text-muted-foreground py-2">Loading...</p>

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{companies.length} company(s)</p>
        {!addingCompany && (
          <Button size="sm" variant="outline" onClick={() => setAddingCompany(true)}>
            <PlusIcon className="h-3.5 w-3.5 mr-1" />
            Add Company
          </Button>
        )}
      </div>

      {addingCompany && (
        <div className="flex items-center gap-2 mb-2">
          <Input autoFocus placeholder="Company name" value={newCompanyName}
            onChange={e => setNewCompanyName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddCompany(); if (e.key === 'Escape') setAddingCompany(false) }}
            className="h-8 text-sm" />
          <Button size="icon-sm" onClick={handleAddCompany} disabled={saving || !newCompanyName.trim()}>
            <CheckIcon className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => { setAddingCompany(false); setNewCompanyName('') }}>
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {companies.length === 0 && !addingCompany && (
        <p className="text-sm text-muted-foreground">No bike companies yet.</p>
      )}

      <ul className="space-y-1">
        {companies.map(company => {
          const companyModels = models.filter(m => m.bikeCompanyId === company.id)
          const isExpanded = expanded === company.id

          return (
            <li key={company.id} className="rounded-md border">
              <div className="flex items-center gap-2 px-2 py-1.5 group">
                <button
                  className="flex items-center gap-1 flex-1 text-sm font-medium text-left"
                  onClick={() => setExpanded(isExpanded ? null : company.id)}
                >
                  {isExpanded ? <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" /> : <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" />}
                  {editCompanyId === company.id ? (
                    <Input autoFocus value={editCompanyName} onChange={e => setEditCompanyName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdateCompany(company.id); if (e.key === 'Escape') setEditCompanyId(null) }}
                      className="h-7 text-sm" onClick={e => e.stopPropagation()} />
                  ) : (
                    <span>{company.name}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-1">({companyModels.length})</span>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editCompanyId === company.id ? (
                    <>
                      <Button size="icon-sm" onClick={() => handleUpdateCompany(company.id)} disabled={saving}>
                        <CheckIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditCompanyId(null)}>
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon-sm" variant="ghost" onClick={() => { setEditCompanyId(company.id); setEditCompanyName(company.name) }}>
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteCompany(company.id)}>
                        <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-2 space-y-1 border-t bg-muted/20">
                  {companyModels.map(model => (
                    <div key={model.id} className="flex items-center gap-2 py-1 group/model">
                      {editModelId === model.id ? (
                        <>
                          <Input autoFocus value={editModelName} onChange={e => setEditModelName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdateModel(model.id); if (e.key === 'Escape') setEditModelId(null) }}
                            className="h-7 text-sm flex-1" />
                          <Button size="icon-sm" onClick={() => handleUpdateModel(model.id)} disabled={saving}>
                            <CheckIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setEditModelId(null)}>
                            <XIcon className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{model.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover/model:opacity-100 transition-opacity">
                            <Button size="icon-sm" variant="ghost" onClick={() => { setEditModelId(model.id); setEditModelName(model.name) }}>
                              <PencilIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteModel(model.id)}>
                              <Trash2Icon className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {addingModelFor === company.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <Input autoFocus placeholder="Model name" value={newModelName}
                        onChange={e => setNewModelName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddModel(company.id); if (e.key === 'Escape') setAddingModelFor(null) }}
                        className="h-7 text-sm flex-1" />
                      <Button size="icon-sm" onClick={() => handleAddModel(company.id)} disabled={saving || !newModelName.trim()}>
                        <CheckIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => { setAddingModelFor(null); setNewModelName('') }}>
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-1"
                      onClick={() => { setAddingModelFor(company.id); setNewModelName('') }}
                    >
                      <PlusIcon className="h-3 w-3" /> Add model
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
