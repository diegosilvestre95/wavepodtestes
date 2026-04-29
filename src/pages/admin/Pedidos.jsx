import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import { useApp } from '../../context/AppContext'
import { WA_DIEGO, WA_LUCAS } from '../../lib/config'

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
      toast(`Pedido ${status}!`, '✅')
      carregar()
    }
  }

  const msgWA = (p) => {
    return encodeURIComponent(`Olá ${p.cliente_nome}, vimos seu pedido de R$ ${fmt(p.total)} no WavePod. Como podemos ajudar?`)
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>SINCRONIZANDO FILA DE PEDIDOS...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Processamento de Pedidos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Fila operacional das transações originadas na vitrine.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <input 
             className="input-field" 
             style={{ width: 260 }} 
             placeholder="Buscar por ID ou Cliente..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
           <button onClick={carregar} className="btn-outline" style={{ padding: '0 16px' }}>ATUALIZAR</button>
        </div>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente / Contato</th>
              <th>Volume Financeiro</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações de Resolução</th>
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
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                     <a href={`https://wa.me/${p.cliente_whatsapp}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#166534', textDecoration: 'none', fontWeight: 800, background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                        CLIENTE 📲
                     </a>
                     <a href={`https://wa.me/${WA_DIEGO}?text=${msgWA(p)}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#1E40AF', textDecoration: 'none', fontWeight: 800, background: '#DBEAFE', padding: '2px 6px', borderRadius: 4 }}>
                        DIEGO 👷
                     </a>
                     <a href={`https://wa.me/${WA_LUCAS}?text=${msgWA(p)}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#1E40AF', textDecoration: 'none', fontWeight: 800, background: '#DBEAFE', padding: '2px 6px', borderRadius: 4 }}>
                        LUCAS 📦
                     </a>
                  </div>
                </td>
                <td style={{ fontWeight: 800, fontSize: 14 }}>R$ {fmt(p.total)}</td>
                <td>
                  <span className={`badge ${p.status === 'Confirmado' ? 'badge-success' : 'badge-warning'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => updateStatus(p.id, 'Confirmado')} className="btn-primary" style={{ padding: '4px 10px', fontSize: 10 }}>APROVAR</button>
                    <button onClick={() => updateStatus(p.id, 'Cancelado')} className="btn-outline" style={{ padding: '4px 10px', fontSize: 10, color: '#DC2626' }}>REJEITAR</button>
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
