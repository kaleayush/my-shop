import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DataTable from 'react-data-table-component'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { searchProducts, createProduct, updateProduct } from '../../store/slices/productSlice'
import { categoryThunks, brandThunks, colorThunks, graphicThunks, bikeCompanyThunks, fetchBikeModelsByCompany } from '../../store/slices/settingsSlice'
import { debounce, emptyToNull } from '../../utils/helpers'
import { formatCurrency } from '../../utils/formatters'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'

const schema = Yup.object({
  productName: Yup.string().required('Name is required').min(2),
  mrp: Yup.number().required('MRP is required').min(0, 'Must be ≥ 0'),
  minimumStockQuantity: Yup.number().required().min(0).integer(),
  categoryId: Yup.string().nullable(),
  brandId: Yup.string().nullable(),
  bikeCompanyId: Yup.string().nullable(),
  bikeModelId: Yup.string().nullable(),
  colorId: Yup.string().nullable(),
  graphicId: Yup.string().nullable(),
  hindiName: Yup.string().nullable(),
  searchKeywords: Yup.string().nullable(),
  barcode: Yup.string().nullable(),
})

const tableCustomStyles = {
  headCells: { style: { fontWeight: '600', fontSize: '13px', color: '#374151', backgroundColor: '#f9fafb' } },
}

export default function ProductsPage() {
  const dispatch = useDispatch()
  const { data: products, loading } = useSelector((s) => s.products)
  const { categories, brands, colors, graphics, bikeCompanies, bikeModels } = useSelector((s) => s.settings)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    dispatch(searchProducts({}))
    dispatch(categoryThunks.fetchAll())
    dispatch(brandThunks.fetchAll())
    dispatch(colorThunks.fetchAll())
    dispatch(graphicThunks.fetchAll())
    dispatch(bikeCompanyThunks.fetchAll())
  }, [dispatch])

  const debouncedSearch = useCallback(
    debounce((q) => dispatch(searchProducts({ query: q || undefined })), 400),
    [dispatch]
  )

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
    debouncedSearch(e.target.value)
  }

  const openAdd = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (row) => {
    setEditTarget(row)
    if (row.bikeCompanyId) dispatch(fetchBikeModelsByCompany(row.bikeCompanyId))
    setFormOpen(true)
  }
  const closeForm = () => { setFormOpen(false); setEditTarget(null) }

  const handleCompanyChange = (e, setFieldValue) => {
    const val = e.target.value
    setFieldValue('bikeCompanyId', val || null)
    setFieldValue('bikeModelId', null)
    if (val) dispatch(fetchBikeModelsByCompany(val))
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const cleaned = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, typeof v === 'string' && v === '' ? null : v])
    )
    const action = editTarget
      ? dispatch(updateProduct({ id: editTarget.id, payload: { ...cleaned, isActive: editTarget.isActive } }))
      : dispatch(createProduct(cleaned))
    const result = await action
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Operation failed'); return }
    toast.success(editTarget ? 'Product updated' : 'Product created')
    resetForm()
    closeForm()
  }

  const columns = [
    { name: 'Product Name', selector: (r) => r.productName, sortable: true, grow: 2 },
    { name: 'Category', selector: (r) => r.categoryName ?? '—' },
    { name: 'Brand', selector: (r) => r.brandName ?? '—' },
    { name: 'MRP', selector: (r) => formatCurrency(r.mrp), sortable: true, width: '110px' },
    { name: 'Available', selector: (r) => r.availableQuantity ?? 0, sortable: true, width: '100px' },
    {
      name: 'Status',
      cell: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '90px',
    },
    {
      name: 'Actions',
      cell: (r) => <Button variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Button>,
      width: '80px',
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openAdd}>+ Add Product</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search products…"
            value={query}
            onChange={handleQueryChange}
            className="max-w-xs"
          />
        </div>
        <DataTable
          columns={columns}
          data={products}
          progressPending={loading}
          pagination
          paginationRowsPerPageOptions={[10, 25, 50]}
          highlightOnHover
          striped
          responsive
          customStyles={tableCustomStyles}
          noDataComponent={<div className="py-12 text-center text-gray-400 text-sm">No products found</div>}
        />
      </div>

      <Modal isOpen={formOpen} onClose={closeForm} title={editTarget ? 'Edit Product' : 'Add Product'} size="lg">
        <Formik
          key={editTarget?.id ?? 'new'}
          initialValues={{
            productName: editTarget?.productName ?? '',
            mrp: editTarget?.mrp ?? '',
            minimumStockQuantity: editTarget?.minimumStockQuantity ?? 1,
            categoryId: editTarget?.categoryId ?? '',
            brandId: editTarget?.brandId ?? '',
            bikeCompanyId: editTarget?.bikeCompanyId ?? '',
            bikeModelId: editTarget?.bikeModelId ?? '',
            colorId: editTarget?.colorId ?? '',
            graphicId: editTarget?.graphicId ?? '',
            hindiName: editTarget?.hindiName ?? '',
            searchKeywords: editTarget?.searchKeywords ?? '',
            barcode: editTarget?.barcode ?? '',
          }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, setFieldValue, values }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Product Name *</label>
                  <Field as={Input} name="productName" placeholder="Product name" />
                  <ErrorMessage name="productName" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">MRP (₹) *</label>
                  <Field as={Input} name="mrp" type="number" min="0" step="0.01" placeholder="0.00" />
                  <ErrorMessage name="mrp" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Min Stock Qty *</label>
                  <Field as={Input} name="minimumStockQuantity" type="number" min="0" placeholder="1" />
                  <ErrorMessage name="minimumStockQuantity" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <Field as={Select} name="categoryId">
                    <option value="">— Select —</option>
                    {categories.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="form-label">Brand</label>
                  <Field as={Select} name="brandId">
                    <option value="">— Select —</option>
                    {brands.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="form-label">Bike Company</label>
                  <Select
                    value={values.bikeCompanyId ?? ''}
                    onChange={(e) => handleCompanyChange(e, setFieldValue)}
                  >
                    <option value="">— Select —</option>
                    {bikeCompanies.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="form-label">Bike Model</label>
                  <Field as={Select} name="bikeModelId" disabled={!values.bikeCompanyId}>
                    <option value="">— Select —</option>
                    {bikeModels.data
                      .filter((m) => m.bikeCompanyId === values.bikeCompanyId)
                      .map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="form-label">Color</label>
                  <Field as={Select} name="colorId">
                    <option value="">— Select —</option>
                    {colors.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="form-label">Graphic</label>
                  <Field as={Select} name="graphicId">
                    <option value="">— Select —</option>
                    {graphics.data.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="form-label">Hindi Name</label>
                  <Field as={Input} name="hindiName" placeholder="Optional" />
                </div>
                <div>
                  <label className="form-label">Barcode</label>
                  <Field as={Input} name="barcode" placeholder="Optional" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Search Keywords</label>
                  <Field as={Input} name="searchKeywords" placeholder="Comma-separated keywords" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
                  {editTarget ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
