import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, toast } = useApp()
  const navigate = useNavigate()
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const handleLogin = () => {
    if (login(user.trim(), pass)) {
      navigate('/admin')
    } else {
      toast('Credenciais incorretas', '⚠️')
      setPass('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ marginBottom: 24 }}>
          <span className="logo" style={{ fontSize: 22 }}>
            <span className="logo-mark">WP</span>
            <span className="logo-text">WAVEPOD Admin</span>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Usuário</label>
            <input
              placeholder="Digite seu usuário"
              autoCapitalize="none"
              value={user}
              onChange={e => setUser(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button className="btn-primary btn-full" onClick={handleLogin} style={{ marginTop: 4 }}>
            Entrar →
          </button>
        </div>
      </div>
    </div>
  )
}
