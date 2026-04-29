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

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>SYNCING_REQUEST_QUEUE...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Request Processing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Operational queue for storefront transactions.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <input 
             className="input-field" 
             style={{ width: 260 }} 
             placeholder="Search by ID or Client..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
           <button onClick={carregar} className="btn-outline" style={{ padding: '0 16px' }}>REFRESH</button>
        </div>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Client Node</th>
              <th>Financial Volume</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: 11 }}>
                  #REQ_{String(p.id).slice(-6).toUpperCase()}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.cliente_nome} {p.cliente_sobrenome}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                </td>
                <td style={{ fontWeight: 800, fontSize: 14 }}>R$ {fmt(p.total)}</td>
                <td>
                  <span className={`badge ${p.status === 'Confirmado' ? 'badge-success' : 'badge-warning'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => updateStatus(p.id, 'Confirmado')} className="btn-primary" style={{ padding: '4px 10px', fontSize: 10 }}>APPROVE</button>
                    <button onClick={() => updateStatus(p.id, 'Cancelado')} className="btn-outline" style={{ padding: '4px 10px', fontSize: 10, color: '#DC2626' }}>REJECT</button>
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
