import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DataTable from 'react-data-table-component'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { fetchInventory, createBatch, adjustInventory } from '../../store/slices/inventorySlice'
import { searchProducts } from '../../store/slices/productSlice'
import { fetchDealers } from '../../store/slices/dealerSlice'
import { formatCurrency, formatDate } from '../../utils/formatters'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'

const batchSchema = Yup.object({
  productId: Yup.string().required('Product is required'),
  dealerId: Yup.string().required('Dealer is required'),
  mrp: Yup.number().required().min(0),
  purchasePrice: Yup.number().required('Purchase price is required').min(0),
  quantity: Yup.number().required().min(1, 'Min 1').integer(),
  minimumStockQuantity: Yup.number().required().min(0).integer(),
  purchaseDate: Yup.string().required('Purchase date is required'),
  batchNumber: Yup.string().nullable(),
})

const adjustSchema = Yup.object({
  quantityDelta: Yup.number().required().not([0], 'Cannot be zero').integer(),
  reason: Yup.string().nullable(),
})

const tableCustomStyles = {
  headCells: { style: { fontWeight: '600', fontSize: '13px', color: '#374151', backgroundColor: '#f9fafb' } },
}

export default function InventoryPage() {
  const dispatch = useDispatch()
  const { data: batches, loading } = useSelector((s) => s.inventory)
  const { data: products } = useSelector((s) => s.products)
  const { data: dealers } = useSelector((s) => s.dealers)
  const [batchOpen, setBatchOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [showLowStock, setShowLowStock] = useState(false)
  const [filterText, setFilterText] = useState('')

  useEffect(() => {
    dispatch(fetchInventory())
    dispatch(searchProducts({}))
    dispatch(fetchDealers())
  }, [dispatch])

  const filtered = batches.filter((b) => {
    const matchesLow = showLowStock ? b.isLowStock : true
    const matchesText = b.productName?.toLowerCase().includes(filterText.toLowerCase()) ||
      b.dealerName?.toLowerCase().includes(filterText.toLowerCase())
    return matchesLow && matchesText
  })

  const openAdjust = (row) => { setAdjustTarget(row); setAdjustOpen(true) }

  const handleBatchSubmit = async (values, { setSubmitting, resetForm }) => {
    const result = await dispatch(createBatch(values))
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Failed to add batch'); return }
    toast.success('Inventory batch added')
    resetForm()
    setBatchOpen(false)
  }

  const handleAdjustSubmit = async (values, { setSubmitting, resetForm }) => {
    const result = await dispatch(adjustInventory({ inventoryBatchId: adjustTarget.id, ...values }))
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Adjustment failed'); return }
    toast.success('Stock adjusted')
    resetForm()
    setAdjustOpen(false)
    setAdjustTarget(null)
  }

  const columns = [
    { name: 'Product', selector: (r) => r.productName, sortable: true, grow: 2 },
    { name: 'Dealer', selector: (r) => r.dealerName, sortable: true },
    { name: 'Batch #', selector: (r) => r.batchNumber ?? '—' },
    { name: 'MRP', selector: (r) => formatCurrency(r.mrp), width: '100px' },
    { name: 'Available', selector: (r) => r.availableQuantity, sortable: true, width: '100px' },
    { name: 'Purchase Date', selector: (r) => formatDate(r.purchaseDate), width: '130px' },
    {
      name: 'Low Stock',
      cell: (r) => r.isLowStock
        ? <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">Low</span>
        : <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">OK</span>,
      width: '80px',
    },
    {
      name: 'Actions',
      cell: (r) => <Button variant="outline" size="sm" onClick={() => openAdjust(r)}>Adjust</Button>,
      width: '90px',
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Button onClick={() => setBatchOpen(true)}>+ Add Batch</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Search product or dealer…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded"
            />
            Low stock only
          </label>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          progressPending={loading}
          pagination
          paginationRowsPerPageOptions={[10, 25, 50]}
          highlightOnHover
          striped
          responsive
          customStyles={tableCustomStyles}
          noDataComponent={<div className="py-12 text-center text-gray-400 text-sm">No inventory batches found</div>}
        />
      </div>

      <Modal isOpen={batchOpen} onClose={() => setBatchOpen(false)} title="Add Inventory Batch" size="lg">
        <Formik
          initialValues={{ productId: '', dealerId: '', mrp: '', purchasePrice: '', quantity: '', minimumStockQuantity: 1, purchaseDate: new Date().toISOString().split('T')[0], batchNumber: '' }}
          validationSchema={batchSchema}
          onSubmit={handleBatchSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Product *</label>
                  <Field as={Select} name="productId">
                    <option value="">— Select Product —</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.productName}</option>)}
                  </Field>
                  <ErrorMessage name="productId" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Dealer *</label>
                  <Field as={Select} name="dealerId">
                    <option value="">— Select Dealer —</option>
                    {dealers.filter((d) => d.isActive).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Field>
                  <ErrorMessage name="dealerId" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Batch Number</label>
                  <Field as={Input} name="batchNumber" placeholder="Optional" />
                </div>
                <div>
                  <label className="form-label">MRP (₹) *</label>
                  <Field as={Input} name="mrp" type="number" min="0" step="0.01" />
                  <ErrorMessage name="mrp" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Purchase Price (₹) *</label>
                  <Field as={Input} name="purchasePrice" type="number" min="0" step="0.01" />
                  <ErrorMessage name="purchasePrice" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Quantity *</label>
                  <Field as={Input} name="quantity" type="number" min="1" />
                  <ErrorMessage name="quantity" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Min Stock Qty *</label>
                  <Field as={Input} name="minimumStockQuantity" type="number" min="0" />
                  <ErrorMessage name="minimumStockQuantity" component="p" className="field-error" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Purchase Date *</label>
                  <Field as={Input} name="purchaseDate" type="date" />
                  <ErrorMessage name="purchaseDate" component="p" className="field-error" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setBatchOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>Add Batch</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <Modal isOpen={adjustOpen} onClose={() => { setAdjustOpen(false); setAdjustTarget(null) }} title="Adjust Stock" size="sm">
        {adjustTarget && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium">{adjustTarget.productName}</p>
            <p className="text-gray-500">{adjustTarget.dealerName} · Available: {adjustTarget.availableQuantity}</p>
          </div>
        )}
        <Formik
          initialValues={{ quantityDelta: '', reason: '' }}
          validationSchema={adjustSchema}
          onSubmit={handleAdjustSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div>
                <label className="form-label">Quantity Change *</label>
                <Field as={Input} name="quantityDelta" type="number" placeholder="e.g. +10 or -5" />
                <ErrorMessage name="quantityDelta" component="p" className="field-error" />
                <p className="text-xs text-gray-400 mt-1">Use positive to add, negative to deduct</p>
              </div>
              <div>
                <label className="form-label">Reason</label>
                <Field as={Input} name="reason" placeholder="Optional reason" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>Apply</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
