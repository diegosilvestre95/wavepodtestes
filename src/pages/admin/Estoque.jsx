import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Estoque() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('*').order('nome')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const itensFiltrados = useMemo(() => {
    return items.filter(i => 
      i.nome.toLowerCase().includes(busca.toLowerCase()) || 
      i.sabor?.toLowerCase().includes(busca.toLowerCase())
    )
  }, [items, busca])

  const getStatus = (q) => {
    if (q === 0) return { label: 'ESGOTADO', color: '#ef4444' }
    if (q <= 3) return { label: 'BAIXO ESTOQUE', color: '#f59e0b' }
    return { label: 'DISPONÍVEL', color: '#10b981' }
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Lendo inventário completo...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Inventário de Estoque</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Visão detalhada de ativos e custos operacionais.</p>
        </div>
        <button className="btn-action" onClick={carregar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          Atualizar Dados
        </button>
      </div>

      <div className="ipad-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* BARRA DE BUSCA */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #18181b', display: 'flex', alignItems: 'center', gap: 15 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Filtrar estoque (Modelo ou Sabor)..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ background: 'transparent', border: 'none', fontSize: 16, padding: 0, width: '100%', fontWeight: 500 }}
          />
        </div>

        <div className="premium-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: 30 }}>PRODUTO</th>
                <th>SABOR</th>
                <th>QUANTIDADE</th>
                <th>CUSTO UNIT.</th>
                <th>VALOR TOTAL</th>
                <th style={{ textAlign: 'right', paddingRight: 30 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(i => {
                const st = getStatus(i.quantidade)
                return (
                  <tr key={i.id}>
                    <td style={{ paddingLeft: 30, fontWeight: 700, color: '#fff' }}>{i.nome}</td>
                    <td style={{ color: '#52525b' }}>{i.sabor}</td>
                    <td style={{ fontWeight: 800 }}>{i.quantidade} un</td>
                    <td>R$ {fmt(i.custo)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--wp-yellow)' }}>R$ {fmt(i.quantidade * i.custo)}</td>
                    <td style={{ paddingRight: 30 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div className="status-pill" style={{ color: st.color }}>
                          <div className="status-dot" style={{ background: st.color }}></div>
                          {st.label}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
