import { useApp } from '../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Header({ showAdminBtn = false, showLogout = false }) {
  const { logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <div className="logo-mark" />
        <div className="logo-text">WAVEPOD</div>
      </Link>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {showAdminBtn && (
          <button onClick={() => navigate('/admin')} className="btn-primary" style={{ padding: '12px 24px' }}>
             SISTEMA ADMIN
          </button>
        )}
        {showLogout && (
          <button onClick={handleLogout} className="btn-ghost-dark">
            SAIR DO SISTEMA
          </button>
        )}
      </div>
    </header>
  )
}
