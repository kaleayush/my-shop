'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SimpleEntityManager } from './SimpleEntityManager'
import { BikeModelManager } from './BikeModelManager'
import { categoryService, brandService, colorService, graphicService } from '../services/settingsService'

const TABS = [
  { id: 'categories', label: 'Categories' },
  { id: 'brands', label: 'Brands' },
  { id: 'bike-models', label: 'Bike Models' },
  { id: 'colors', label: 'Colors' },
  { id: 'graphics', label: 'Graphics' },
] as const

type TabId = typeof TABS[number]['id']

export function MasterDataSettings() {
  const [active, setActive] = useState<TabId>('categories')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage master data for your shop</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-40 shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                active === tab.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 max-w-lg">
          <h2 className="text-base font-semibold mb-3">
            {TABS.find(t => t.id === active)?.label}
          </h2>

          {active === 'categories' && (
            <SimpleEntityManager label="Category" service={categoryService} />
          )}
          {active === 'brands' && (
            <SimpleEntityManager label="Brand" service={brandService} />
          )}
          {active === 'bike-models' && (
            <BikeModelManager />
          )}
          {active === 'colors' && (
            <SimpleEntityManager label="Color" service={colorService} />
          )}
          {active === 'graphics' && (
            <SimpleEntityManager label="Graphic" service={graphicService} />
          )}
        </div>
      </div>
    </div>
  )
}
