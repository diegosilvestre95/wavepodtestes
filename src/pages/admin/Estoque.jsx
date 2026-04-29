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

  const getStatusCor = (qtd) => {
    if (qtd <= 0) return '#ef4444'
    if (qtd < 5) return '#f59e0b'
    return '#10b981'
  }

  if (loading) return <div style={{ padding: 40, color: '#666', fontSize: 13 }}>Carregando inventário...</div>

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Gestão de Estoque</h1>
          <p className="subtext">Controle em tempo real de ativos e disponibilidade.</p>
        </div>
        <div style={{ padding: '8px 16px', background: '#050505', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: 12 }}>
           <span className="label-caps" style={{ marginRight: 8 }}>Total de Itens:</span>
           <span style={{ fontWeight: 800 }}>{produtos.reduce((a, b) => a + (b.quantidade || 0), 0)} un</span>
        </div>
      </div>

      <div className="premium-table-wrap">
        <div style={{ padding: '16px 20px', background: '#050505', borderBottom: '1px solid var(--border-subtle)' }}>
           <div className="label-caps">Inventário Geral</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Produto / Modelo</th>
              <th>Sabor</th>
              <th>Preço Venda</th>
              <th>Custo Médio</th>
              <th>Qtd em Mãos</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 700 }}>{p.nome}</td>
                <td style={{ color: '#94a3b8' }}>{p.sabor || '—'}</td>
                <td style={{ fontWeight: 800 }}>R$ {fmt(p.preco_venda)}</td>
                <td style={{ color: '#475569' }}>R$ {fmt(p.custo)}</td>
                <td style={{ fontWeight: 800, fontSize: 15 }}>{p.quantidade} un</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusCor(p.quantidade) }}></div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: getStatusCor(p.quantidade) }}>
                      {p.quantidade <= 0 ? 'ESGOTADO' : p.quantidade < 5 ? 'BAIXO' : 'OK'}
                    </span>
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
