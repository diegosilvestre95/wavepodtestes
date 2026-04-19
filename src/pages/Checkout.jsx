import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { sb } from '../lib/supabase'
import { fmt } from '../lib/utils'
import Header from '../components/Header'

export default function Checkout() {
  const { cart, removeFromCart, clearCart, toast } = useApp()
  const navigate = useNavigate()

  const [nome, setNome]   = useState('')
  const [sobre, setSobre] = useState('')
  const [wa, setWa]       = useState('')
  const [pagSel, setPag]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(null) // número do pedido

  const total = cart.reduce((a, i) => a + i.preco * i.qty, 0)
  const count = cart.reduce((a, i) => a + i.qty, 0)

  const finalizar = async () => {
    if (!nome.trim())  return toast('Informe seu nome', '⚠️')
    if (!sobre.trim()) return toast('Informe seu sobrenome', '⚠️')
    if (!wa.trim())    return toast('Informe seu WhatsApp', '⚠️')
    if (!pagSel)       return toast('Escolha a forma de pagamento', '⚠️')
    if (!cart.length)  return toast('Carrinho vazio', '⚠️')

    setLoading(true)
    const numPedido = '#' + Date.now().toString().slice(-6)
    const itensJSON = JSON.stringify(cart.map(i => ({ nome: i.nome, sabor: i.sabor, qty: i.qty, preco: i.preco })))

    const { error } = await sb.from('pedidos').insert({
      numero_pedido: numPedido,
      cliente_nome: nome.trim(),
      cliente_sobrenome: sobre.trim(),
      cliente_whatsapp: wa.trim(),
      itens: itensJSON,
      pagamento: pagSel,
      total,
      status: 'Pendente',
    })

    if (error) {
      console.error(error)
      toast('Erro ao registrar pedido. Tente novamente.', '⚠️')
      setLoading(false)
      return
    }

    clearCart()
    setSucesso(numPedido)
    setLoading(false)
  }

  if (sucesso) {
    return (
      <>
        <Header showAdminBtn />
        <div className="success-wrap">
          <div className="suc-icon">🎉</div>
          <div className="suc-title">Pedido Recebido!</div>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 6px' }}>Número do pedido</p>
          <div className="suc-num">{sucesso}</div>
          <p className="suc-sub">Recebemos seu pedido! Em breve entraremos em contato no seu WhatsApp para confirmar e combinar a entrega.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
            <a href="https://wa.me/5511958438636" target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>💬 Diego</a>
            <a href="https://wa.me/5511978378289" target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', background: 'linear-gradient(110deg,#128C7E,#25D366)' }}>💬 Lucas</a>
          </div>
          <button className="btn-ghost" onClick={() => navigate('/')}>Fazer outro pedido</button>
        </div>
      </>
    )
  }

  return (
    <>
      <Header showAdminBtn />
      <div className="checkout-wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-ghost" onClick={() => navigate('/')} style={{ padding: '8px 14px' }}>← Voltar</button>
          <h2 className="checkout-title" style={{ margin: 0 }}>Seu Pedido</h2>
        </div>

        {/* Itens */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Itens</h3>
          {cart.map((item, idx) => (
            <div key={idx} className="ci-row">
              <div className="ci-info">
                <div className="ci-name">{item.nome} × {item.qty}</div>
                <div className="ci-flavor">🍃 {item.sabor}</div>
              </div>
              <div className="ci-price">R$ {(item.preco * item.qty).toFixed(2).replace('.', ',')}</div>
              <button className="ci-rm" onClick={() => removeFromCart(idx)}>✕</button>
            </div>
          ))}
          <div className="checkout-total">
            <span className="checkout-total-label">Total</span>
            <span className="checkout-total-value">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Dados do cliente */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Seus dados</h3>
          <div className="form-grid fg-2" style={{ marginBottom: 12 }}>
            <div className="form-group">
              <label>Nome</label>
              <input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Sobrenome</label>
              <input placeholder="Sobrenome" value={sobre} onChange={e => setSobre(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>WhatsApp (com DDD)</label>
            <input placeholder="(11) 99999-9999" type="tel" value={wa} onChange={e => setWa(e.target.value)} />
          </div>
        </div>

        {/* Pagamento */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Pagamento</h3>
          <div className="payment-grid">
            {['Débito', 'Crédito', 'Pix'].map(m => (
              <div key={m}
                className={`popt${pagSel === m ? ' sel' : ''}`}
                onClick={() => setPag(m)}>
                <span className="pay-icon">{m === 'Pix' ? '⚡' : '💳'}</span>{m}
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary btn-full" disabled={loading} onClick={finalizar}>
          {loading ? 'Enviando...' : 'Finalizar Pedido →'}
        </button>
      </div>
    </>
  )
}
