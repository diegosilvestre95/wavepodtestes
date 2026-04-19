import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function Header({ showAdminBtn = false, showLogout = false }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <span className="logo">
        <span className="logo-mark">〜</span>
        <span className="logo-text">WAVEPOD</span>
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {showLogout && currentUser && (
          <>
            <span className="role-badge">{currentUser.nome}</span>
            <span className="rt-dot" title="Sincronização ativa" />
            <button className="btn-logout" onClick={handleLogout}>Sair</button>
          </>
        )}
        {showAdminBtn && !currentUser && (
          <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 13px' }}
            onClick={() => navigate('/login')}>
            🔐 Admin
          </button>
        )}
      </div>
    </header>
  )
}
