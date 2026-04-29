import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import { useApp } from '../../context/AppContext'

export default function Pedidos() {
  const { toast } = useApp()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('pedidos').select('*').order('created_at', { ascending: false })
    setPedidos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(p => 
      p.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) || 
      p.cliente_sobrenome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.status?.toLowerCase().includes(busca.toLowerCase()) ||
      String(p.id).includes(busca)
    )
  }, [pedidos, busca])

  const updateStatus = async (id, status) => {
    const { error } = await sb.from('pedidos').update({ status }).eq('id', id)
    if (!error) {
      toast(`Order ${status}!`, '✅')
      carregar()
    }
  }

  if (loading) return (
    <div style={{ height: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader"></div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFF' }}>Requests <span style={{ color: 'var(--wp-yellow)' }}>Pipeline</span></h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Real-time synchronization of storefront acquisition nodes.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <input 
             className="input-premium" 
             style={{ width: 300, background: 'rgba(255,255,255,0.02)' }} 
             placeholder="Search by ID or Client..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
           <button onClick={carregar} className="btn-ultimate" style={{ padding: '0 20px', background: 'transparent', border: '1px solid var(--border)', color: '#FFF' }}>
              SYNC
           </button>
        </div>
      </div>

      <div className="premium-card">
        <table className="wp-surface">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Client Node</th>
              <th>Total Yield</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>
                  REQ_{String(p.id).slice(-6).toUpperCase()}
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#FFF' }}>{p.cliente_nome} {p.cliente_sobrenome}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dark)' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                </td>
                <td style={{ fontWeight: 900, color: 'var(--wp-yellow)', fontSize: 16 }}>R$ {fmt(p.total)}</td>
                <td>
                  <span className={`status-chip ${p.status === 'Confirmado' ? 'success' : p.status === 'Cancelado' ? 'warning' : ''}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => updateStatus(p.id, 'Confirmado')} 
                      className="status-chip success" 
                      style={{ cursor: 'pointer', border: 'none', padding: '8px 12px' }}
                    >
                      APPROVE
                    </button>
                    <button 
                      onClick={() => updateStatus(p.id, 'Cancelado')} 
                      className="status-chip warning" 
                      style={{ cursor: 'pointer', border: 'none', padding: '8px 12px' }}
                    >
                      REJECT
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
