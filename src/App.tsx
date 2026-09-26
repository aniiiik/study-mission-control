import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Analytics from './pages/Analytics'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Notes from './pages/Notes'
import Planner from './pages/Planner'
import Revision from './pages/Revision'
import Subjects from './pages/Subjects'
import Timer from './pages/Timer'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/timer" element={<Timer />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/revision" element={<Revision />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/subjects" element={<Subjects />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App