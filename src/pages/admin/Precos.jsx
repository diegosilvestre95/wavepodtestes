import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Precos() {
  const { toast } = useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const carregar = async () => {
    setLoading(true)
    const { data: produtos } = await sb.from('produtos').select('*')
    setData(produtos || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const modelosFiltrados = useMemo(() => {
    const groups = {}
    data.forEach(p => {
      if (!groups[p.nome]) {
        groups[p.nome] = { ...p, total_estoque: 0 }
      }
      groups[p.nome].total_estoque += (p.quantidade || 0)
    })
    
    return Object.values(groups).filter(m => 
      m.nome.toLowerCase().includes(busca.toLowerCase())
    )
  }, [data, busca])

  const atualizarLocal = (nome, val) => {
    setData(prev => prev.map(p => p.nome === nome ? { ...p, preco_venda: val } : p))
  }

  const salvarModelos = async () => {
    try {
      const promises = modelosFiltrados.map(m => 
        sb.from('produtos').update({ preco_venda: m.preco_venda }).eq('nome', m.nome)
      )
      await Promise.all(promises)
      toast('Tabela de preços sincronizada!', '💰')
      carregar()
    } catch (e) {
      toast('Erro ao sincronizar preços', '❌')
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
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFF' }}>Config <span style={{ color: 'var(--wp-yellow)' }}>Nexus</span></h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Global price node synchronization for online catalogs.</p>
        </div>
        <button className="btn-ultimate" onClick={salvarModelos} style={{ padding: '16px 40px' }}>
           SYNC_CHANGES ✓
        </button>
      </div>

      <div className="premium-card">
         <div style={{ marginBottom: 40, display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 20, color: 'var(--text-dark)' }}>🔍</span>
            <input 
              className="input-premium" 
              style={{ border: 'none', padding: '10px 0', fontSize: 18, fontWeight: 500 }}
              placeholder="Search resource model..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
         </div>

        <table className="wp-surface">
          <thead>
            <tr>
              <th>Model / Resource</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Yield Config (R$)</th>
            </tr>
          </thead>
          <tbody>
            {modelosFiltrados.map(m => (
              <tr key={m.nome}>
                <td style={{ fontWeight: 800, fontSize: 18, color: '#FFF' }}>{m.nome}</td>
                <td>
                   <span className={`status-chip ${m.total_estoque > 0 ? 'success' : ''}`}>
                     {m.total_estoque} UNITS_AVAILABLE
                   </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', width: 160 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--wp-yellow)', fontSize: 14 }}>R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        className="input-premium"
                        value={m.preco_venda} 
                        onChange={(e) => atualizarLocal(m.nome, e.target.value)}
                        style={{ paddingLeft: 45, fontWeight: 900, fontSize: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
                      />
                    </div>
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
