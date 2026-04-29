import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Estoque() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('*').order('nome')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

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

      <div className="premium-table-wrap">
        <table>
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>SABOR</th>
              <th>QUANTIDADE</th>
              <th>CUSTO UNIT.</th>
              <th>VALOR TOTAL</th>
              <th style={{ textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => {
              const st = getStatus(i.quantidade)
              return (
                <tr key={i.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{i.nome}</td>
                  <td style={{ color: '#52525b' }}>{i.sabor}</td>
                  <td style={{ fontWeight: 800 }}>{i.quantidade} un</td>
                  <td>R$ {fmt(i.custo_unitario)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--wp-yellow)' }}>R$ {fmt(i.quantidade * i.custo_unitario)}</td>
                  <td>
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
  )
}
