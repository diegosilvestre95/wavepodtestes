import { useApp } from '../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Header({ showAdminBtn = false, showLogout = false }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <div className="logo-mark">WP</div>
        <div className="logo-text">WAVEPOD</div>
      </Link>

      <div style={{ display: 'flex', gap: '12px' }}>
        {showAdminBtn && (
          <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
            👑 Admin
          </button>
        )}
        {showLogout && (
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
            Sair
          </button>
        )}
      </div>
    </header>
  )
}
