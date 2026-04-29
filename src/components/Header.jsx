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
        <div className="logo-mark" />
        <div className="logo-text">WAVEPOD</div>
      </Link>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {showAdminBtn && (
          <button onClick={() => navigate('/admin')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 11, borderRadius: '30px' }}>
             Admin Panel
          </button>
        )}
        {showLogout && (
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '10px 20px', fontSize: 12 }}>
            Sair
          </button>
        )}
      </div>
    </header>
  )
}
