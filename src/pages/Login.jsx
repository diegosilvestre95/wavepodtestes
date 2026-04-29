import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const { login, loading } = useApp()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const success = await login(user, pass)
    if (success) navigate('/admin')
  }

  return (
    <div className="login-container" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #111111 0%, #09090b 100%)'
    }}>
      
      <div className="login-box" style={{ 
        animation: 'fadeIn 0.8s ease-out',
        background: '#121212',
        border: '1px solid #27272a',
        padding: '60px 40px',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <Logo size={70} showText={true} light />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          
          <div className="form-group">
            <label style={{ color: '#52525b', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 10, display: 'block' }}>IDENTIFICAÇÃO DE ACESSO</label>
            <div style={{ position: 'relative' }}>
               <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>👤</span>
               <input 
                type="text" 
                placeholder="Nome de usuário" 
                value={user} 
                onChange={e => setUser(e.target.value)}
                style={{ paddingLeft: 45, background: '#050505', height: 56 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: '#52525b', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 10, display: 'block' }}>SENHA DE SEGURANÇA</label>
            <div style={{ position: 'relative' }}>
               <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔒</span>
               <input 
                type="password" 
                placeholder="••••••••" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                style={{ paddingLeft: 45, background: '#050505', height: 56 }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ 
              marginTop: 10, 
              height: 60, 
              fontSize: 15, 
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, var(--wp-yellow) 0%, #b8860b 100%)',
              boxShadow: '0 20px 40px rgba(255, 215, 0, 0.15)'
            }}
          >
            {loading ? 'AUTENTICANDO...' : 'SISTEMA LOGIN →'}
          </button>

        </form>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#333', fontWeight: 600, letterSpacing: '0.05em' }}>
            WAVEPOD v2.0.4 · SEGURANÇA ENCRIPTADA
          </div>
        </div>

      </div>

      {/* DETALHES DE FUNDO (DECORATIVO) */}
      <div style={{ 
        position: 'fixed', 
        top: '10%', 
        right: '10%', 
        width: 300, 
        height: 300, 
        background: 'var(--wp-yellow)', 
        filter: 'blur(150px)', 
        opacity: 0.03, 
        zIndex: -1 
      }}></div>

    </div>
  )
}
