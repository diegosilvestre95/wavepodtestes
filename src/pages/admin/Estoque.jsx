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

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Lendo inventário completo...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Inventário de Estoque</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Visão detalhada de todos os itens e custos operacionais.</p>
        </div>
        <button className="btn-action" onClick={carregar}>🔄 ATUALIZAR</button>
      </div>

      <div className="premium-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Sabor</th>
              <th>Estoque</th>
              <th>Custo Unit.</th>
              <th>Vlr em Estoque</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td style={{ fontWeight: 700, color: '#fff' }}>{i.nome}</td>
                <td>{i.sabor}</td>
                <td style={{ fontWeight: 800, color: i.quantidade <= 2 ? '#ef4444' : '#fff' }}>{i.quantidade} un</td>
                <td>R$ {fmt(i.custo_unitario)}</td>
                <td style={{ fontWeight: 700 }}>R$ {fmt(i.quantidade * i.custo_unitario)}</td>
                <td>
                  <span className={`status-pill ${i.quantidade === 0 ? 'warning' : ''}`} 
                        style={{ background: i.quantidade === 0 ? '#ef4444' : i.quantidade <= 2 ? '#f59e0b' : 'var(--wp-yellow)' }}>
                    {i.quantidade === 0 ? 'ESGOTADO' : i.quantidade <= 2 ? 'BAIXO' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
