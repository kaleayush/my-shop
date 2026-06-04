import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import {
  uploadPurchaseBill,
  confirmPurchaseBill,
  clearCurrentBill,
  mapBillItem,
  createProductFromBillItem,
} from '../../store/slices/purchaseBillSlice'
import { fetchDealers } from '../../store/slices/dealerSlice'
import { searchProducts } from '../../store/slices/productSlice'
import { formatCurrency } from '../../utils/formatters'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'

const uploadSchema = Yup.object({
  dealerId: Yup.string().required('Dealer is required'),
  billDate: Yup.string().required('Bill date is required'),
  totalAmount: Yup.number().required().min(0),
  paidAmount: Yup.number().required().min(0),
  billNumber: Yup.string().nullable(),
  file: Yup.mixed().required('File is required'),
})

export default function PurchaseBillsPage() {
  const dispatch = useDispatch()
  const { currentBill, loading } = useSelector((s) => s.purchaseBills)
  const { data: dealers } = useSelector((s) => s.dealers)
  const { data: products } = useSelector((s) => s.products)
  const [itemMappings, setItemMappings] = useState({})
  const [mapModalItem, setMapModalItem] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [processingItems, setProcessingItems] = useState(new Set())

  useEffect(() => {
    dispatch(fetchDealers())
    dispatch(searchProducts({}))
  }, [dispatch])

  useEffect(() => {
    if (currentBill?.items) {
      const mappings = {}
      currentBill.items.forEach((item) => {
        mappings[item.id] = {
          productId: item.productId ?? item.suggestedProductId ?? '',
          rawProductName: item.rawProductName,
          quantity: item.quantity,
          mrp: item.mrp ?? 0,
          purchasePrice: item.purchasePrice,
        }
      })
      setItemMappings(mappings)
    }
  }, [currentBill])

  const setProcessing = (id, active) =>
    setProcessingItems((prev) => {
      const next = new Set(prev)
      active ? next.add(id) : next.delete(id)
      return next
    })

  const handleUpload = async (values, { setSubmitting }) => {
    const result = await dispatch(uploadPurchaseBill(values))
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Upload failed'); return }
    toast.success('Bill uploaded — please review items')
  }

  const handleAcceptItem = async (item) => {
    setProcessing(item.id, true)
    const result = await dispatch(createProductFromBillItem({
      billId: currentBill.id,
      payload: {
        purchaseBillItemId: item.id,
        productName: item.rawProductName,
        minimumStockQuantity: 0,
      },
    }))
    setProcessing(item.id, false)
    if (result.error) toast.error(result.payload ?? 'Failed to create product')
    else toast.success(`"${item.rawProductName}" added as new product & mapped`)
  }

  const handleMapItem = async (itemId, productId) => {
    setProcessing(itemId, true)
    const result = await dispatch(mapBillItem({
      billId: currentBill.id,
      payload: { purchaseBillItemId: itemId, productId },
    }))
    setProcessing(itemId, false)
    setMapModalItem(null)
    if (result.error) toast.error(result.payload ?? 'Mapping failed')
    else toast.success('Item mapped to product')
  }

  const unmappedCount = Object.values(itemMappings).filter((m) => !m.productId).length

  const handleConfirm = async () => {
    if (unmappedCount > 0) {
      toast.error(`Map all items first — ${unmappedCount} item(s) still unmapped`)
      return
    }

    const items = Object.entries(itemMappings).map(([id, m]) => ({
      purchaseBillItemId: id,
      productId: m.productId,
      rawProductName: m.rawProductName,
      quantity: Number(m.quantity),
      mrp: Number(m.mrp),
      purchasePrice: Number(m.purchasePrice),
    }))

    const result = await dispatch(confirmPurchaseBill({
      id: currentBill.id,
      payload: { paidAmount: currentBill.paidAmount, items },
    }))
    if (result.error) { toast.error(result.payload ?? 'Confirmation failed'); return }
    toast.success('Purchase bill confirmed — inventory updated')
    dispatch(clearCurrentBill())
  }

  const searchResults = productSearch.length >= 2
    ? products.filter((p) => p.productName.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8)
    : []

  if (currentBill) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Purchase Bill</h1>
            <p className="text-gray-500 text-sm">
              {currentBill.dealerName} · Bill #{currentBill.billNumber ?? 'N/A'} · Total: {formatCurrency(currentBill.totalAmount)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => dispatch(clearCurrentBill())}>← Back</Button>
            <Button
              onClick={handleConfirm}
              loading={loading}
              disabled={currentBill.items.length === 0 || unmappedCount > 0}
            >
              {unmappedCount > 0 ? `Map ${unmappedCount} item(s) first` : 'Confirm & Update Inventory'}
            </Button>
          </div>
        </div>

        {currentBill.items.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4 text-amber-800">
            <p className="font-semibold">No items were extracted from this bill.</p>
            <p className="text-sm mt-1">{currentBill.extractionStatus || 'The file could not be parsed automatically.'}</p>
            <p className="text-sm mt-1">Use the <strong>← Back</strong> button to go back and upload a different file, or contact support to enable OCR for image bills.</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">Raw Product Name</th>
                <th className="text-left px-4 py-3">Mapped Product</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-right px-4 py-3">MRP</th>
                <th className="text-right px-4 py-3">Purchase Price</th>
                <th className="text-center px-4 py-3">Confidence</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBill.items.map((item) => {
                const mapping = itemMappings[item.id] ?? {}
                const mapped = products.find((p) => p.id === mapping.productId)
                const busy = processingItems.has(item.id)
                return (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.rawProductName}</td>
                    <td className="px-4 py-3">
                      {mapped ? (
                        <span className="text-green-700 font-medium">{mapped.productName}</span>
                      ) : (
                        <span className="text-red-500 text-xs">Not mapped</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.mrp)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.purchasePrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${item.matchConfidence >= 80 ? 'text-green-600' : item.matchConfidence >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {item.matchConfidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {!mapping.productId && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={busy}
                            onClick={() => handleAcceptItem(item)}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            Accept
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => { setMapModalItem(item); setProductSearch('') }}
                        >
                          {mapping.productId ? 'Remap' : 'Map'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Modal isOpen={!!mapModalItem} onClose={() => setMapModalItem(null)} title="Map to Product" size="sm">
          {mapModalItem && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Mapping: <strong>{mapModalItem.rawProductName}</strong></p>
              <Input
                placeholder="Search product…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                autoFocus
              />
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b last:border-0"
                    onClick={() => handleMapItem(mapModalItem.id, p.id)}
                  >
                    {p.productName}
                  </button>
                ))}
                {productSearch.length >= 2 && searchResults.length === 0 && (
                  <p className="px-3 py-3 text-xs text-gray-400">No products found</p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Purchase Bill</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <Formik
          initialValues={{ dealerId: '', billNumber: '', billDate: new Date().toISOString().split('T')[0], totalAmount: '', paidAmount: '', file: null }}
          validationSchema={uploadSchema}
          onSubmit={handleUpload}
        >
          {({ isSubmitting, isValid, dirty, setFieldValue }) => (
            <Form className="space-y-4">
              <div>
                <label className="form-label">Dealer *</label>
                <Field as={Select} name="dealerId">
                  <option value="">— Select Dealer —</option>
                  {dealers.filter((d) => d.isActive).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Field>
                <ErrorMessage name="dealerId" component="p" className="field-error" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Bill Number</label>
                  <Field as={Input} name="billNumber" placeholder="Optional" />
                </div>
                <div>
                  <label className="form-label">Bill Date *</label>
                  <Field as={Input} name="billDate" type="date" />
                  <ErrorMessage name="billDate" component="p" className="field-error" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Total Amount (₹) *</label>
                  <Field as={Input} name="totalAmount" type="number" min="0" step="0.01" />
                  <ErrorMessage name="totalAmount" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Paid Amount (₹) *</label>
                  <Field as={Input} name="paidAmount" type="number" min="0" step="0.01" />
                  <ErrorMessage name="paidAmount" component="p" className="field-error" />
                </div>
              </div>
              <div>
                <label className="form-label">Bill Image / PDF *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFieldValue('file', e.currentTarget.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <ErrorMessage name="file" component="p" className="field-error" />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!(isValid && dirty) || isSubmitting}
                loading={isSubmitting || loading}
              >
                Upload & Process
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
