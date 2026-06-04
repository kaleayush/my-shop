import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { registerShopOwner } from '../../store/slices/authSlice'
import { ROUTES } from '../../config/routes'
import Button from '../../components/Button'
import Input from '../../components/Input'

const schema = Yup.object({
  shopName: Yup.string().required('Shop name is required').min(2),
  ownerName: Yup.string().required('Your name is required').min(2),
  phone: Yup.string().required('Phone is required').matches(/^[0-9+\-\s]{7,15}$/, 'Invalid phone'),
  address: Yup.string(),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
})

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  const handleSubmit = async (values, { setSubmitting }) => {
    const { confirmPassword, ...payload } = values
    const result = await dispatch(registerShopOwner(payload))
    setSubmitting(false)
    if (result.error) {
      toast.error(result.payload ?? 'Registration failed')
      return
    }
    toast.success('Shop registered successfully!')
    navigate(ROUTES.DASHBOARD, { replace: true })
  }

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-white font-bold text-lg">AP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Register Your Shop</h1>
        <p className="text-gray-500 text-sm mt-1">Create your AutoParts POS account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Formik
          initialValues={{ shopName: '', ownerName: '', phone: '', address: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Shop Name *</label>
                  <Field as={Input} name="shopName" placeholder="My Auto Parts Shop" />
                  <ErrorMessage name="shopName" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Your Name *</label>
                  <Field as={Input} name="ownerName" placeholder="Owner name" />
                  <ErrorMessage name="ownerName" component="p" className="field-error" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone *</label>
                  <Field as={Input} name="phone" type="tel" placeholder="9876543210" />
                  <ErrorMessage name="phone" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <Field as={Input} name="address" placeholder="Shop address" />
                  <ErrorMessage name="address" component="p" className="field-error" />
                </div>
              </div>
              <div>
                <label className="form-label">Email *</label>
                <Field as={Input} name="email" type="email" placeholder="owner@shop.com" />
                <ErrorMessage name="email" component="p" className="field-error" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Password *</label>
                  <Field as={Input} name="password" type="password" placeholder="Min 8 characters" />
                  <ErrorMessage name="password" component="p" className="field-error" />
                </div>
                <div>
                  <label className="form-label">Confirm Password *</label>
                  <Field as={Input} name="confirmPassword" type="password" placeholder="Repeat password" />
                  <ErrorMessage name="confirmPassword" component="p" className="field-error" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!(isValid && dirty) || isSubmitting}
                loading={isSubmitting || loading}
              >
                Create Account
              </Button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
