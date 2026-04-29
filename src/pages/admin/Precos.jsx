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

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>SYNCING_PRICE_TABLE...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Pricing Matrix</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Global value configuration for online assets.</p>
        </div>
        <button className="btn-primary" onClick={salvarModelos} style={{ padding: '10px 24px' }}>
           SAVE_ADJUSTMENTS ✓
        </button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
           <span style={{ fontSize: 14 }}>🔍</span>
           <input 
             className="input-field" 
             style={{ border: 'none', background: 'transparent', width: 300, padding: 0 }}
             placeholder="Search by model name..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
        </div>

        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Resource Model</th>
              <th>Current Volume</th>
              <th style={{ textAlign: 'right' }}>Active Unit Price (R$)</th>
            </tr>
          </thead>
          <tbody>
            {modelosFiltrados.map(m => (
              <tr key={m.nome}>
                <td style={{ fontWeight: 700, fontSize: 14 }}>{m.nome}</td>
                <td>
                   <span className={`badge ${m.total_estoque > 0 ? 'badge-success' : 'badge-warning'}`}>
                     {m.total_estoque} UNITS_LINKED
                   </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', width: 140 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-muted)', fontSize: 11 }}>R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        className="input-field"
                        value={m.preco_venda} 
                        onChange={(e) => atualizarLocal(m.nome, e.target.value)}
                        style={{ paddingLeft: 36, fontWeight: 800, fontSize: 15, height: 38 }}
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
