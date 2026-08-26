import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useApp } from './contexts/AppContext'
import AppLayout from './components/layout/AppLayout'
import LoadingScreen from './components/ui/LoadingScreen'
import Toast from './components/ui/Toast'

// Lazy-loaded screens
const LoginScreen = lazy(() => import('./components/screens/LoginScreen'))
const OnboardingScreen = lazy(() => import('./components/screens/OnboardingScreen'))
const HomeScreen = lazy(() => import('./components/screens/HomeScreen'))
const FarmMapScreen = lazy(() => import('./components/screens/FarmMapScreen'))
const SoilScreen = lazy(() => import('./components/screens/SoilScreen'))
const CropRecommendScreen = lazy(() => import('./components/screens/CropRecommendScreen'))
const VarietyScreen = lazy(() => import('./components/screens/VarietyScreen'))
const SeedPlanScreen = lazy(() => import('./components/screens/SeedPlanScreen'))
const CultivationScreen = lazy(() => import('./components/screens/CultivationScreen'))
const WeatherScreen = lazy(() => import('./components/screens/WeatherScreen'))
const DiseaseScreen = lazy(() => import('./components/screens/DiseaseScreen'))
const MonitorScreen = lazy(() => import('./components/screens/MonitorScreen'))
const YieldScreen = lazy(() => import('./components/screens/YieldScreen'))
const MarketScreen = lazy(() => import('./components/screens/MarketScreen'))
const SchemesScreen = lazy(() => import('./components/screens/SchemesScreen'))
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen'))
const ProfileScreen = lazy(() => import('./components/screens/ProfileScreen'))
const CommunityScreen = lazy(() => import('./components/screens/CommunityScreen'))
const ChatScreen = lazy(() => import('./components/screens/ChatScreen'))

function ProtectedRoute({ children }) {
  const { user, loading, farmerProfile } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  // First-time users who haven't completed onboarding
  if (!farmerProfile?.onboarded && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { toasts } = useApp()

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingScreen /></ProtectedRoute>} />

          {/* Protected — inside AppLayout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<HomeScreen />} />
            <Route path="farm" element={<FarmMapScreen />} />
            <Route path="soil" element={<SoilScreen />} />
            <Route path="crops" element={<CropRecommendScreen />} />
            <Route path="crops/varieties" element={<VarietyScreen />} />
            <Route path="crops/seed-plan" element={<SeedPlanScreen />} />
            <Route path="cultivation" element={<CultivationScreen />} />
            <Route path="weather" element={<WeatherScreen />} />
            <Route path="disease" element={<DiseaseScreen />} />
            <Route path="monitor" element={<MonitorScreen />} />
            <Route path="yield" element={<YieldScreen />} />
            <Route path="market" element={<MarketScreen />} />
            <Route path="schemes" element={<SchemesScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="community" element={<CommunityScreen />} />
            <Route path="chat" element={<ChatScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Toasts */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} {...t} />)}
      </div>
    </>
  )
}
