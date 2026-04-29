import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [userKey, setUserKey] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    const success = login(userKey, pass)
    if (success) {
      navigate('/admin')
    } else {
      alert('Usuário ou senha incorretos. Verifique suas credenciais.')
    }
    setLoading(false)
  }

  return (
    <div className="login-container-new">
      {/* BACKGROUND GRID MESH */}
      <div className="grid-overlay"></div>

      <div className="login-content-split">
        
        {/* HERO SECTION (LEFT) */}
        <div className="hero-section">
          <div style={{ marginBottom: 40 }}>
             <Logo size={80} light />
          </div>
          <h1 className="hero-title">
            A Gestão do Seu Lucro<br />
            <span>Começa Aqui</span>
          </h1>
          <p className="hero-desc">
            O WavePod Admin é a plataforma definitiva para centralizar suas vendas, 
            automatizar o controle de estoque e escalar seus lucros através de uma 
            gestão ERP inteligente e integrada.
          </p>

          <div className="pill-group">
            <div className="pill-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.9.9L21 3z"></path></svg>
              WhatsApp
            </div>
            <div className="pill-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              ERP Inteligente
            </div>
            <div className="pill-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 2 15 22 11 13 2 9 22 2"></polyline></svg>
              Escala
            </div>
          </div>
        </div>

        {/* LOGIN CARD (RIGHT) */}
        <div className="login-card-wrapper">
          <div className="login-card-premium">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
               <div style={{ display: 'inline-block', padding: 12, background: 'rgba(255,215,0,0.05)', borderRadius: 16, marginBottom: 15 }}>
                  <Logo size={40} showText={false} light />
               </div>
               <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>WavePod Admin</h2>
               <p style={{ fontSize: 13, color: '#52525b', fontWeight: 500 }}>Painel de Controle</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group-premium">
                <label>Usuário ou E-mail</label>
                <input 
                  type="text" 
                  placeholder="Ex: admin" 
                  value={userKey} 
                  onChange={e => setUserKey(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-premium">
                <label>Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={pass} 
                  onChange={e => setPass(e.target.value)}
                  required
                />
              </div>

              <button className="btn-login-glow" disabled={loading}>
                {loading ? 'AUTENTICANDO...' : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                    ENTRAR NO PAINEL
                  </>
                )}
              </button>
            </form>

            <p style={{ marginTop: 30, fontSize: 11, color: '#3f3f46', textAlign: 'center' }}>
               Acesso restrito a administradores autorizados.
            </p>
          </div>
        </div>

      </div>

      <style>{`
        .login-container-new {
          min-height: 100vh;
          background: #020617;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          position: relative;
          overflow: hidden;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(15, 23, 42, 0.5) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(15, 23, 42, 0.5) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%);
        }

        .login-content-split {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 100vh;
          position: relative;
          z-index: 10;
        }

        .hero-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          background: radial-gradient(circle at 0% 0%, rgba(255,215,0,0.03) 0%, transparent 50%);
        }

        .hero-title {
          font-size: 80px;
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.05em;
          color: #fff;
          margin-bottom: 24px;
        }

        .hero-title span {
          color: var(--wp-yellow);
        }

        .hero-desc {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 460px;
        }

        .pill-group {
          display: flex;
          gap: 15px;
        }

        .pill-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(30, 41, 59, 0.5);
          padding: 10px 20px;
          border-radius: 12px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-card-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.2);
          padding: 40px;
        }

        .login-card-premium {
          width: 100%;
          max-width: 480px;
          background: #0f172a;
          border: 1px solid rgba(51, 65, 85, 0.4);
          padding: 60px;
          border-radius: 32px;
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.9);
        }

        .form-group-premium {
          margin-bottom: 20px;
        }

        .form-group-premium label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group-premium input {
          width: 100%;
          height: 52px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 18px;
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
          transition: all 0.2s;
        }

        .form-group-premium input:focus {
          border-color: var(--wp-yellow);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.05);
        }

        .btn-login-glow {
          width: 100%;
          height: 54px;
          background: var(--wp-yellow);
          color: #000;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 20px -6px rgba(255, 215, 0, 0.4);
        }

        .btn-login-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(255, 215, 0, 0.6);
        }

        @media (max-width: 1024px) {
          .login-content-split {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .hero-section {
            text-align: center;
            align-items: center;
          }
          .hero-title { font-size: 48px; }
        }
      `}</style>
    </div>
  )
}
