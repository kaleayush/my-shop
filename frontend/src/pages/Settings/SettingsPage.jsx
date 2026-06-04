import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import {
  categoryThunks,
  brandThunks,
  colorThunks,
  graphicThunks,
  bikeCompanyThunks,
  fetchBikeModels,
  createBikeModel,
  updateBikeModel,
  deleteBikeModel,
} from '../../store/slices/settingsSlice'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'

const nameSchema = Yup.object({ name: Yup.string().required('Name is required').min(2) })

const TABS = [
  { key: 'categories', label: 'Categories' },
  { key: 'brands', label: 'Brands' },
  { key: 'colors', label: 'Colors' },
  { key: 'graphics', label: 'Graphics' },
  { key: 'bikeCompanies', label: 'Bike Companies' },
  { key: 'bikeModels', label: 'Bike Models' },
]

const THUNKS = {
  categories: categoryThunks,
  brands: brandThunks,
  colors: colorThunks,
  graphics: graphicThunks,
  bikeCompanies: bikeCompanyThunks,
}

function SimpleEntityManager({ entityKey, thunks }) {
  const dispatch = useDispatch()
  const { data, loading } = useSelector((s) => s.settings[entityKey])
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { dispatch(thunks.fetchAll()) }, [dispatch])

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const action = editId
      ? dispatch(thunks.update({ id: editId, name: values.name }))
      : dispatch(thunks.create({ name: values.name }))
    const result = await action
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Failed'); return }
    toast.success(editId ? 'Updated' : 'Created')
    resetForm()
    setEditId(null)
  }

  const handleDelete = async () => {
    const result = await dispatch(thunks.delete(deleteId))
    if (result.error) { toast.error(result.payload ?? 'Delete failed'); return }
    toast.success('Deleted')
    setDeleteId(null)
  }

  const editTarget = data.find((i) => i.id === editId)

  return (
    <div className="space-y-4">
      <Formik
        key={editId ?? 'new'}
        initialValues={{ name: editTarget?.name ?? '' }}
        validationSchema={nameSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, dirty, resetForm }) => (
          <Form className="flex gap-2">
            <div className="flex-1">
              <Field as={Input} name="name" placeholder={editId ? 'Edit name' : 'New name'} />
              <ErrorMessage name="name" component="p" className="field-error" />
            </div>
            <Button type="submit" disabled={!(isValid && dirty) || isSubmitting} loading={isSubmitting} size="sm">
              {editId ? 'Update' : 'Add'}
            </Button>
            {editId && (
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditId(null); resetForm() }}>
                Cancel
              </Button>
            )}
          </Form>
        )}
      </Formik>

      <div className="border rounded-xl overflow-hidden">
        {data.length === 0 ? (
          <p className="py-6 text-center text-gray-400 text-sm">No items yet</p>
        ) : (
          data.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-gray-50">
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setEditId(item.id)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(item.id)}>Del</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
        <p className="text-gray-600 mb-6">Delete <strong>{data.find((i) => i.id === deleteId)?.name}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

function BikeModelManager() {
  const dispatch = useDispatch()
  const { bikeCompanies, bikeModels } = useSelector((s) => s.settings)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    dispatch(bikeCompanyThunks.fetchAll())
    dispatch(fetchBikeModels())
  }, [dispatch])

  const filtered = bikeModels.data.filter((m) => !selectedCompanyId || m.bikeCompanyId === selectedCompanyId)
  const editTarget = bikeModels.data.find((m) => m.id === editId)

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!selectedCompanyId && !editId) { toast.error('Select a company first'); return }
    const action = editId
      ? dispatch(updateBikeModel({ id: editId, name: values.name }))
      : dispatch(createBikeModel({ bikeCompanyId: selectedCompanyId, name: values.name }))
    const result = await action
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Failed'); return }
    toast.success(editId ? 'Updated' : 'Created')
    resetForm()
    setEditId(null)
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteBikeModel(deleteId))
    if (result.error) { toast.error(result.payload ?? 'Delete failed'); return }
    toast.success('Deleted')
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Company</label>
        <Select value={selectedCompanyId} onChange={(e) => { setSelectedCompanyId(e.target.value); setEditId(null) }} className="max-w-xs">
          <option value="">— All —</option>
          {bikeCompanies.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      <Formik
        key={editId ?? 'new'}
        initialValues={{ name: editTarget?.name ?? '' }}
        validationSchema={nameSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, dirty, resetForm }) => (
          <Form className="flex gap-2">
            <div className="flex-1">
              <Field as={Input} name="name" placeholder={editId ? 'Edit model name' : 'New model name'} />
              <ErrorMessage name="name" component="p" className="field-error" />
            </div>
            <Button type="submit" disabled={!(isValid && dirty) || isSubmitting || (!selectedCompanyId && !editId)} loading={isSubmitting} size="sm">
              {editId ? 'Update' : 'Add'}
            </Button>
            {editId && (
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditId(null); resetForm() }}>Cancel</Button>
            )}
          </Form>
        )}
      </Formik>

      <div className="border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-gray-400 text-sm">No models{selectedCompanyId ? ' for this company' : ''}</p>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-xs text-gray-400 ml-2">{m.bikeCompanyName}</span>
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setEditId(m.id)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(m.id)}>Del</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
        <p className="text-gray-600 mb-6">Delete model <strong>{bikeModels.data.find((m) => m.id === deleteId)?.name}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={bikeModels.loading}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Master Data Settings</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-xl">
        {activeTab === 'bikeModels' ? (
          <BikeModelManager />
        ) : (
          <SimpleEntityManager
            entityKey={activeTab}
            thunks={THUNKS[activeTab]}
          />
        )}
      </div>
    </div>
  )
}
