import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('*').order('nome')
    setProdutos(data || [])
    setLoading(false)
  }

  const getSt = (q) => q <= 0 ? '#ef4444' : q < 5 ? '#f59e0b' : '#10b981'

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Mapeando inventário...</div>

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h3>Inventário em Tempo Real</h3>
        <div style={{ padding: '8px 16px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}>
          <span className="stat-label">Total Unidades: </span>
          <span style={{ fontWeight: 800 }}>{produtos.reduce((a, b) => a + (b.quantidade || 0), 0)}</span>
        </div>
      </div>

      <table className="table-container">
        <thead>
          <tr><th>Produto</th><th>Sabor</th><th>Preço</th><th>Custo</th><th>Estoque</th><th>Status</th></tr>
        </thead>
        <tbody>
          {produtos.map(p => (
            <tr key={p.id}>
              <td><strong>{p.nome}</strong></td>
              <td style={{ color: 'var(--text-secondary)' }}>{p.sabor || '—'}</td>
              <td style={{ fontWeight: 700 }}>R$ {fmt(p.preco_venda)}</td>
              <td style={{ color: 'var(--text-muted)' }}>R$ {fmt(p.custo)}</td>
              <td style={{ fontSize: 16, fontWeight: 800 }}>{p.quantidade} un</td>
              <td>
                <span style={{ 
                  fontSize: 10, fontWeight: 900, color: getSt(p.quantidade),
                  padding: '4px 8px', background: `${getSt(p.quantidade)}15`, borderRadius: 4
                }}>
                  {p.quantidade <= 0 ? 'ESGOTADO' : p.quantidade < 5 ? 'CRÍTICO' : 'DISPONÍVEL'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
