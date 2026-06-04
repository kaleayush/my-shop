import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './config/routes'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './common/ProtectedRoute'
import AuthVerify from './common/AuthVerify'
import Loader from './components/Loader'

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'))
const DealersPage = lazy(() => import('./pages/Dealers/DealersPage'))
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'))
const InventoryPage = lazy(() => import('./pages/Products/InventoryPage'))
const PosPage = lazy(() => import('./pages/POS/PosPage'))
const PurchaseBillsPage = lazy(() => import('./pages/PurchaseBills/PurchaseBillsPage'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))
const ReturnsPage = lazy(() => import('./pages/Returns/ReturnsPage'))
const PaymentsPage = lazy(() => import('./pages/Payments/PaymentsPage'))
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthVerify />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.DEALERS} element={<DealersPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
            <Route path={ROUTES.POS} element={<PosPage />} />
            <Route path={ROUTES.PURCHASE_BILLS} element={<PurchaseBillsPage />} />
            <Route path={ROUTES.RETURNS} element={<ReturnsPage />} />
            <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
            <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
