import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useMsal } from '@azure/msal-react'
import { loginUser } from '../../store/slices/authSlice'
import { loginRequest } from '../../config/authConfig'
import { ROUTES } from '../../config/routes'
import Button from '../../components/Button'
import Input from '../../components/Input'

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
})

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading } = useSelector((state) => state.auth)
  const { instance } = useMsal()
  const from = location.state?.from?.pathname ?? ROUTES.DASHBOARD

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await dispatch(loginUser(values))
    setSubmitting(false)
    if (result.error) {
      toast.error(result.payload ?? 'Login failed')
      return
    }
    toast.success('Welcome back!')
    navigate(from, { replace: true })
  }

  const handleMsalLogin = async () => {
    try {
      await instance.loginPopup(loginRequest)
      toast.success('Signed in with Microsoft')
      navigate(from, { replace: true })
    } catch (err) {
      if (err.errorCode !== 'user_cancelled') {
        toast.error('Microsoft sign-in failed')
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-white font-bold text-lg">AP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AutoParts POS</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form className="space-y-4">
              <div>
                <label className="form-label">Email</label>
                <Field as={Input} name="email" type="email" placeholder="you@example.com" />
                <ErrorMessage name="email" component="p" className="field-error" />
              </div>
              <div>
                <label className="form-label">Password</label>
                <Field as={Input} name="password" type="password" placeholder="••••••••" />
                <ErrorMessage name="password" component="p" className="field-error" />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!(isValid && dirty) || isSubmitting}
                loading={isSubmitting || loading}
              >
                Sign In
              </Button>
            </Form>
          )}
        </Formik>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMsalLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Continue with Microsoft
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          New shop?{' '}
          <Link to={ROUTES.REGISTER} className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
