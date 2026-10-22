import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="p-6 text-center">
        <p>Algo salió mal. Tus datos siguen guardados.</p>
        <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2" onClick={() => location.reload()}>Recargar</button>
      </div>
    )
  }
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>)
