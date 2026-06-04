import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DataTable from 'react-data-table-component'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { fetchDealers, createDealer, updateDealer, deleteDealer } from '../../store/slices/dealerSlice'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const schema = Yup.object({
  name: Yup.string().required('Name is required').min(2, 'Min 2 characters'),
  phone: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone').nullable(),
  address: Yup.string().nullable(),
  notes: Yup.string().nullable(),
})

const tableCustomStyles = {
  headCells: { style: { fontWeight: '600', fontSize: '13px', color: '#374151', backgroundColor: '#f9fafb' } },
}

export default function DealersPage() {
  const dispatch = useDispatch()
  const { data: dealers, loading } = useSelector((s) => s.dealers)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterText, setFilterText] = useState('')

  useEffect(() => { dispatch(fetchDealers()) }, [dispatch])

  const filtered = dealers.filter((d) =>
    d.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (d.phone ?? '').includes(filterText)
  )

  const openAdd = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (row) => { setEditTarget(row); setFormOpen(true) }
  const openDelete = (row) => { setDeleteTarget(row); setDeleteOpen(true) }
  const closeForm = () => { setFormOpen(false); setEditTarget(null) }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const action = editTarget
      ? dispatch(updateDealer({ id: editTarget.id, payload: values }))
      : dispatch(createDealer(values))
    const result = await action
    setSubmitting(false)
    if (result.error) { toast.error(result.payload ?? 'Operation failed'); return }
    toast.success(editTarget ? 'Dealer updated' : 'Dealer created')
    resetForm()
    closeForm()
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteDealer(deleteTarget.id))
    if (result.error) {
      toast.error(result.payload ?? 'Delete failed')
    } else {
      toast.success('Dealer deleted')
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  const columns = [
    { name: 'Name', selector: (r) => r.name, sortable: true, grow: 2 },
    { name: 'Phone', selector: (r) => r.phone ?? '—' },
    { name: 'Address', selector: (r) => r.address ?? '—', grow: 2 },
    {
      name: 'Status',
      cell: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '90px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => openDelete(r)}>Delete</Button>
        </div>
      ),
      width: '160px',
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
        <Button onClick={openAdd}>+ Add Dealer</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search by name or phone…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-xs"
          />
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
          noDataComponent={
            <div className="py-12 text-center text-gray-400 text-sm">No dealers found</div>
          }
        />
      </div>

      <Modal isOpen={formOpen} onClose={closeForm} title={editTarget ? 'Edit Dealer' : 'Add Dealer'}>
        <Formik
          key={editTarget?.id ?? 'new'}
          initialValues={{
            name: editTarget?.name ?? '',
            phone: editTarget?.phone ?? '',
            address: editTarget?.address ?? '',
            notes: editTarget?.notes ?? '',
          }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <Field as={Input} name="name" placeholder="Dealer name" />
                <ErrorMessage name="name" component="p" className="field-error" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone</label>
                  <Field as={Input} name="phone" placeholder="Phone number" />
                  <ErrorMessage name="phone" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <Field as={Input} name="address" placeholder="Address" />
                  <ErrorMessage name="address" component="p" className="field-error" />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <Field as={Input} name="notes" placeholder="Optional notes" />
                <ErrorMessage name="notes" component="p" className="field-error" />
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

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Delete" size="sm">
        <p className="text-gray-600 mb-6">
          Delete dealer <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
