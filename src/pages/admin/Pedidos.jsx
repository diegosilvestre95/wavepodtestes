import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import { useApp } from '../../context/AppContext'

export default function Pedidos() {
  const { toast } = useApp()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('pedidos').select('*').order('created_at', { ascending: false })
    setPedidos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const updateStatus = async (id, status) => {
    const { error } = await sb.from('pedidos').update({ status }).eq('id', id)
    if (!error) {
      toast(`Pedido ${status}!`, '✅')
      carregar()
    }
  }

  const getStatusColor = (s) => {
    if (s === 'Confirmado') return '#10b981'
    if (s === 'Cancelado') return '#ef4444'
    return 'var(--wp-yellow)'
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Sincronizando fila de pedidos...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Fila de Pedidos</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Acompanhe e gerencie as solicitações da vitrine em tempo real.</p>
        </div>
        <button className="btn-action" onClick={carregar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          Atualizar Dados
        </button>
      </div>

      <div className="premium-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID PEDIDO</th>
              <th>CLIENTE</th>
              <th>CONTATO</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', color: '#52525b', fontWeight: 700 }}>#{String(p.id).slice(0,6).toUpperCase()}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.cliente_nome} {p.cliente_sobrenome}</div>
                  <div style={{ fontSize: 10, opacity: 0.4 }}>{new Date(p.created_at).toLocaleString()}</div>
                </td>
                <td>
                  <a href={`https://wa.me/${p.cliente_whatsapp}`} target="_blank" rel="noreferrer" style={{ 
                    color: '#a1a1aa', textDecoration: 'none', fontSize: 11, fontWeight: 800, 
                    border: '1px solid #27272a', padding: '6px 12px', borderRadius: '8px'
                  }}>
                    CONTATO
                  </a>
                </td>
                <td style={{ fontWeight: 800, fontSize: 15 }}>R$ {fmt(p.total)}</td>
                <td>
                  <div className="status-pill" style={{ color: getStatusColor(p.status) }}>
                    <div className="status-dot" style={{ background: getStatusColor(p.status) }}></div>
                    {p.status.toUpperCase()}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn-action" 
                            style={{ padding: '6px', minWidth: '32px', color: '#10b981', background: 'transparent' }} 
                            title="Confirmar Pedido"
                            onClick={() => updateStatus(p.id, 'Confirmado')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button className="btn-action" 
                            style={{ padding: '6px', minWidth: '32px', color: '#ef4444', background: 'transparent' }} 
                            title="Cancelar Pedido"
                            onClick={() => updateStatus(p.id, 'Cancelado')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
