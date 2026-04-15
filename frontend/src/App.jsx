import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import NetworkOverview from './pages/NetworkOverview'
import StoreDetail from './pages/StoreDetail'
import Alerts from './pages/Alerts'
import VoiceAgent from './components/VoiceAgent'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('storeos_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <VoiceAgent />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><NetworkOverview /></ProtectedRoute>} />
          <Route path="/store/:id" element={<ProtectedRoute><StoreDetail /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
