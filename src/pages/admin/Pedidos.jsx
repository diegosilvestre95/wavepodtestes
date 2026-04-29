import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'

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

  useEffect(() => {
    carregar()
    const onPed = () => carregar()
    window.addEventListener('wvpod:novopedido', onPed)
    return () => window.removeEventListener('wvpod:novopedido', onPed)
  }, [])

  const updateStatus = async (id, status) => {
    const { error } = await sb.from('pedidos').update({ status }).eq('id', id)
    if (error) return toast('Erro ao atualizar status', '❌')
    toast(`Pedido ${status}!`, '✅')
    window.dispatchEvent(new CustomEvent('wvpod:pedidoatualizado'))
    carregar()
  }

  if (loading) return <div style={{ padding: 60, color: '#999' }}>Consultando base de pedidos...</div>

  return (
    <div className="admin-wrapper" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>Gestão de Pedidos</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Acompanhe e gerencie as solicitações da vitrine em tempo real.</p>
        </div>
        <button className="btn-action" onClick={carregar}>🔄 ATUALIZAR LISTA</button>
      </div>

      <div className="premium-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>WhatsApp</th>
              <th>Pagamento</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => {
              const cliente = `${p.cliente_nome} ${p.cliente_sobrenome}`
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: '#000' }}>{p.numero_pedido}</td>
                  <td style={{ fontWeight: 600 }}>{cliente}</td>
                  <td>
                    <a href={`https://wa.me/${p.cliente_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" 
                       style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>
                      💬 ABRIR CHAT
                    </a>
                  </td>
                  <td><span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{p.pagamento}</span></td>
                  <td style={{ fontWeight: 800, color: '#000' }}>R$ {fmt(p.total)}</td>
                  <td>
                    <span className={`status-chip ${p.status === 'Concluído' ? 'success' : p.status === 'Cancelado' ? 'warning' : ''}`} 
                          style={{ background: p.status === 'Pendente' ? '#f1f3f5' : '' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {p.status === 'Pendente' && (
                        <>
                          <button className="btn-action" style={{ background: '#22c55e', padding: '6px 12px' }} onClick={() => updateStatus(p.id, 'Concluído')}>V</button>
                          <button className="btn-action" style={{ background: '#ef4444', padding: '6px 12px' }} onClick={() => updateStatus(p.id, 'Cancelado')}>X</button>
                        </>
                      )}
                      {p.status !== 'Pendente' && <span style={{ fontSize: 11, color: '#ccc', fontWeight: 700 }}>FINALIZADO</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 60, color: '#999' }}>Nenhum pedido registrado até o momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
