import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import {
  fetchActiveDrafts, createDraft, loadDraft, addDraftItem,
  removeDraftItem, holdDraft, cancelDraft, completeDraft, selectDraft, closeDraftTab,
} from '../../store/slices/posSlice'
import { searchProducts } from '../../store/slices/productSlice'
import ProductService from '../../services/ProductService'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { debounce } from '../../utils/helpers'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'

const PaymentMode = { Cash: 1, UPI: 2, Card: 3, BankTransfer: 4, Other: 5 }

const checkoutSchema = Yup.object({
  paidAmount: Yup.number().required('Amount is required').min(0),
  paymentMode: Yup.number().required('Payment mode is required'),
  notes: Yup.string().nullable(),
  customerName: Yup.string().nullable(),
  customerPhone: Yup.string().nullable(),
})

export default function PosPage() {
  const dispatch = useDispatch()
  const { activeDrafts, selectedDraftId, currentDraft, loading } = useSelector((s) => s.pos)
  const { data: products } = useSelector((s) => s.products)
  const [productSearch, setProductSearch] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [newDraftOpen, setNewDraftOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [addingItem, setAddingItem] = useState(null)
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [itemPrice, setItemPrice] = useState('')
  const [loadingProduct, setLoadingProduct] = useState(false)

  useEffect(() => { dispatch(fetchActiveDrafts()) }, [dispatch])

  const debouncedSearch = useCallback(
    debounce((q) => { if (q) dispatch(searchProducts({ query: q })) }, 350),
    [dispatch]
  )

  const handleSearchChange = (e) => {
    setProductSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleNewDraft = async () => {
    const result = await dispatch(createDraft({ customerName: customerName || null }))
    if (result.error) { toast.error(result.payload ?? 'Failed to create bill'); return }
    toast.success('New bill started')
    setNewDraftOpen(false)
    setCustomerName('')
  }

  const handleSelectTab = async (id) => {
    dispatch(selectDraft(id))
    const result = await dispatch(loadDraft(id))
    if (result.error) toast.error('Failed to load bill')
  }

  const handleCloseTab = (e, id) => {
    e.stopPropagation()
    dispatch(closeDraftTab(id))
  }

  const handleSelectProduct = async (p) => {
    setLoadingProduct(true)
    setProductSearch('')
    try {
      const detail = await ProductService.getById(p.id)
      const firstBatch = detail.batches?.[0]
      setAddingItem(detail)
      setSelectedBatchId(firstBatch?.id ?? '')
      setItemPrice(String(detail.mrp))
    } catch {
      toast.error('Failed to load product details')
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleAddItem = async () => {
    if (!addingItem || !selectedDraftId) return
    const batch = addingItem.batches?.find((b) => b.id === selectedBatchId) ?? addingItem.batches?.[0]
    if (!batch) { toast.error('No inventory batch for this product'); return }
    const result = await dispatch(addDraftItem({
      draftId: selectedDraftId,
      payload: {
        productId: addingItem.id,
        inventoryBatchId: batch.id,
        quantity: Number(itemQty),
        sellingPrice: Number(itemPrice) || addingItem.mrp,
      },
    }))
    if (result.error) { toast.error(result.payload ?? 'Failed to add item'); return }
    toast.success(`${addingItem.productName} added`)
    setAddingItem(null)
    setSelectedBatchId('')
    setItemQty(1)
    setItemPrice('')
  }

  const handleRemoveItem = async (itemId) => {
    const result = await dispatch(removeDraftItem({ draftId: selectedDraftId, itemId }))
    if (result.error) toast.error(result.payload ?? 'Failed to remove item')
  }

  const handleHold = async () => {
    const result = await dispatch(holdDraft(selectedDraftId))
    if (result.error) { toast.error(result.payload ?? 'Failed'); return }
    toast.info('Bill put on hold')
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this bill? Reserved stock will be released.')) return
    const result = await dispatch(cancelDraft(selectedDraftId))
    if (result.error) { toast.error(result.payload ?? 'Failed'); return }
    toast.warning('Bill cancelled')
  }

  const handleCheckout = async (values, { setSubmitting }) => {
    const result = await dispatch(completeDraft({ draftId: selectedDraftId, payload: values }))
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Checkout failed'); return }
    toast.success('Sale completed!')
    setCheckoutOpen(false)
  }

  const searchResults = productSearch.length >= 2
    ? products.filter((p) => p.productName.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold text-gray-900 mr-2">POS Billing</h1>
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {activeDrafts.map((d) => (
            <button
              key={d.id}
              onClick={() => handleSelectTab(d.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border transition-colors ${
                selectedDraftId === d.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {d.draftNumber}
              {d.customerName && <span className="opacity-75">· {d.customerName}</span>}
              <span
                onClick={(e) => handleCloseTab(e, d.id)}
                className="ml-1 opacity-60 hover:opacity-100 text-xs leading-none"
              >✕</span>
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setNewDraftOpen(true)}>+ New Bill</Button>
      </div>

      {!selectedDraftId ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Create a new bill to start billing
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Input
                placeholder="Search product to add…"
                value={productSearch}
                onChange={handleSearchChange}
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      disabled={loadingProduct}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b last:border-0 disabled:opacity-50"
                    >
                      <span className="font-medium">{p.productName}</span>
                      <span className="text-gray-400 ml-2 text-xs">MRP {formatCurrency(p.mrp)} · Avail: {p.availableQuantity}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loadingProduct && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 text-center">
                Loading product details…
              </div>
            )}

            {addingItem && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="font-medium text-blue-900 mb-3">{addingItem.productName}</p>
                {addingItem.batches?.length === 0 && (
                  <p className="text-sm text-amber-700 mb-3">No stock batches. Add inventory first.</p>
                )}
                {addingItem.batches?.length > 1 && (
                  <div className="mb-3">
                    <label className="form-label text-xs">Dealer / Batch</label>
                    <Select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                      {addingItem.batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.dealerName} — Avail: {b.availableQuantity} @ ₹{b.mrp}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="form-label text-xs">Quantity</label>
                    <Input type="number" min="1" value={itemQty} onChange={(e) => setItemQty(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label text-xs">Selling Price (₹)</label>
                    <Input type="number" min="0" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddItem} loading={loading}>Add to Bill</Button>
                  <Button size="sm" variant="outline" onClick={() => { setAddingItem(null); setSelectedBatchId('') }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
              <span className="font-semibold text-sm">{currentDraft?.draftNumber}</span>
              {currentDraft?.customerName && (
                <span className="text-xs text-gray-500">{currentDraft.customerName}</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {(!currentDraft?.items?.length) ? (
                <div className="py-8 text-center text-gray-400 text-sm">No items added</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="text-left px-3 py-2">Product</th>
                      <th className="text-right px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Price</th>
                      <th className="text-right px-3 py-2">Total</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDraft.items.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{item.productName}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.sellingPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                        <td className="px-2 py-2">
                          <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t p-3">
              <div className="flex justify-between font-bold text-lg mb-3">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(currentDraft?.totalAmount ?? 0)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleHold} disabled={!currentDraft?.items?.length}>Hold</Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                <Button className="flex-1" onClick={() => setCheckoutOpen(true)} disabled={!currentDraft?.items?.length}>
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={newDraftOpen} onClose={() => setNewDraftOpen(false)} title="New Bill" size="sm">
        <div className="space-y-4">
          <div>
            <label className="form-label">Customer Name (Optional)</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNewDraftOpen(false)}>Cancel</Button>
            <Button onClick={handleNewDraft} loading={loading}>Start Bill</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Complete Sale" size="sm">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex justify-between">
          <span className="text-sm text-gray-600">Total Amount</span>
          <span className="font-bold text-lg">{formatCurrency(currentDraft?.totalAmount ?? 0)}</span>
        </div>
        <Formik
          initialValues={{ paidAmount: currentDraft?.totalAmount ?? '', paymentMode: PaymentMode.Cash, notes: '', customerName: currentDraft?.customerName ?? '', customerPhone: '' }}
          validationSchema={checkoutSchema}
          enableReinitialize
          onSubmit={handleCheckout}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div>
                <label className="form-label">Paid Amount (₹) *</label>
                <Field as={Input} name="paidAmount" type="number" min="0" step="0.01" />
                <ErrorMessage name="paidAmount" component="p" className="field-error" />
              </div>
              <div>
                <label className="form-label">Payment Mode *</label>
                <Field as={Select} name="paymentMode">
                  <option value={PaymentMode.Cash}>Cash</option>
                  <option value={PaymentMode.UPI}>UPI</option>
                  <option value={PaymentMode.Card}>Card</option>
                  <option value={PaymentMode.BankTransfer}>Bank Transfer</option>
                  <option value={PaymentMode.Other}>Other</option>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Customer Name</label>
                  <Field as={Input} name="customerName" placeholder="Optional" />
                </div>
                <div>
                  <label className="form-label">Customer Phone</label>
                  <Field as={Input} name="customerPhone" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <Field as={Input} name="notes" placeholder="Optional" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                <Button type="submit" variant="success" disabled={!isValid || isSubmitting} loading={isSubmitting}>
                  Complete Sale
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
