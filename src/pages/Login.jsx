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
    <div className="login-portal" style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: '#09090b',
      color: '#fff'
    }}>
      
      {/* LADO ESQUERDO: BRANDING & IMPACTO (DESKTOP ONLY) */}
      <div className="login-hero" style={{ 
        flex: 1, 
        background: 'radial-gradient(circle at 70% 30%, #1a1a1e 0%, #09090b 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        borderRight: '1px solid #18181b',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Logo size={120} showText={false} light />
          <h1 style={{ fontSize: 56, fontWeight: 800, marginTop: 40, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
            A Gestão do Seu <br/>
            <span style={{ color: 'var(--wp-yellow)' }}>Lucro Começa Aqui.</span>
          </h1>
          <p style={{ marginTop: 24, color: '#52525b', fontSize: 18, maxWidth: 400, lineHeight: 1.6 }}>
            Bem-vindo ao ERP WavePod. Controle seus dividendos, estoque e vendas em uma interface de alta performance.
          </p>
        </div>

        {/* EFEITOS DE FUNDO */}
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: 400, height: 400, background: 'var(--wp-yellow)', filter: 'blur(180px)', opacity: 0.05 }}></div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO DE ACESSO */}
      <div className="login-form-side" style={{ 
        width: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#09090b'
      }}>
        
        <div style={{ width: '100%', maxWidth: '360px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ marginBottom: 40 }}>
             <Logo size={40} light />
             <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 20 }}>Portal Administrativo</h2>
             <p style={{ color: '#52525b', fontSize: 14 }}>Insira suas credenciais para gerenciar a operação.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label style={{ color: '#3f3f46', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>IDENTIFICAÇÃO</label>
              <input 
                type="text" 
                placeholder="Nome de usuário" 
                value={user} 
                onChange={e => setUser(e.target.value)}
                style={{ background: '#121212', height: 52, border: '1px solid #1e1e22' }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: '#3f3f46', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>SENHA PRIVADA</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                style={{ background: '#121212', height: 52, border: '1px solid #1e1e22' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ 
                marginTop: 10, 
                height: 56, 
                fontSize: 14,
                boxShadow: '0 15px 30px rgba(255, 215, 0, 0.1)'
              }}
            >
              {loading ? 'AUTENTICANDO...' : 'ACESSAR DASHBOARD →'}
            </button>
          </form>

          <div style={{ marginTop: 60, fontSize: 10, color: '#27272a', fontWeight: 600, textAlign: 'center' }}>
            WAVEPOD v2.0.4 · SISTEMA DE GESTÃO SOCIETÁRIA
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .login-hero { display: none !important; }
          .login-form-side { width: 100% !important; }
        }
      `}</style>

    </div>
  )
}
