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

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Sincronizando fila de pedidos...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Fila de Pedidos</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Acompanhe e gerencie as solicitações da vitrine em tempo real.</p>
        </div>
        <button className="btn-action" onClick={carregar}>🔄 ATUALIZAR FILA</button>
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
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--wp-yellow)', fontWeight: 700 }}>#{String(p.id).slice(0,6).toUpperCase()}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.cliente_nome} {p.cliente_sobrenome}</div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>{new Date(p.created_at).toLocaleString()}</div>
                </td>
                <td>
                  <a href={`https://wa.me/${p.cliente_whatsapp}`} target="_blank" rel="noreferrer" style={{ 
                    color: '#22c55e', textDecoration: 'none', fontSize: 11, fontWeight: 800, 
                    background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: '8px'
                  }}>
                    💬 WHATSAPP
                  </a>
                </td>
                <td style={{ fontWeight: 800, fontSize: 16 }}>R$ {fmt(p.total)}</td>
                <td>
                  <span className="status-pill" style={{ 
                    background: p.status === 'Confirmado' ? '#10b981' : p.status === 'Cancelado' ? '#ef4444' : 'var(--wp-yellow)',
                    color: p.status === 'Pendente' ? '#000' : '#fff'
                  }}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-action" style={{ padding: '6px 10px', background: '#10b981' }} onClick={() => updateStatus(p.id, 'Confirmado')}>✓</button>
                    <button className="btn-action" style={{ padding: '6px 10px', background: '#ef4444' }} onClick={() => updateStatus(p.id, 'Cancelado')}>✕</button>
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
