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
      toast('Acesso negado. Verifique suas credenciais.', '🔒')
      setPass('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5', padding: 24 }}>
      <div className="stat-card" style={{ width: '100%', maxWidth: 400, background: '#fff', border: '1px solid #ddd', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: 40, color: '#1a1a1a' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="logo-mark" style={{ width: 60, height: 60, fontSize: 24, margin: '0 auto 20px' }}>WP</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>WAVEPOD</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Controle Administrativo de Vendas</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>Identificação</label>
            <input
              placeholder="Nome de usuário"
              style={{ background: '#f9f9f9', border: '1px solid #eee', color: '#000', padding: '14px 18px', borderRadius: '12px' }}
              value={user}
              onChange={e => setUser(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>Senha Privada</label>
            <input
              type="password"
              placeholder="••••••••"
              style={{ background: '#f9f9f9', border: '1px solid #eee', color: '#000', padding: '14px 18px', borderRadius: '12px' }}
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: 10, height: 52 }} onClick={handleLogin}>
            SISTEMA LOGIN →
          </button>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#ccc' }}>
          WavePod v2.0.4 · Segurança Encriptada
        </div>
      </div>
    </div>
  )
}
