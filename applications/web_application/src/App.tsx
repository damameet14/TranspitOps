import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderPage title="TransitOps" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title" style={{ color: 'var(--accent)' }}>{title}</h1>
        <p className="login-subtitle">Smart transport operations platform</p>
        <p className="text-center text-muted" style={{ fontSize: 'var(--font-size-small)' }}>
          Phase 1 complete — infrastructure scaffold ready.
        </p>
      </div>
    </div>
  )
}

export default App
