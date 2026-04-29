import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import { useApp } from '../../context/AppContext'

export default function Estoque() {
  const { toast } = useApp()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const carregarDados = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('*').order('nome')
    setProdutos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregarDados() }, [])

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => 
      p.nome.toLowerCase().includes(busca.toLowerCase()) || 
      (p.sabor || '').toLowerCase().includes(busca.toLowerCase())
    )
  }, [produtos, busca])

  const ajustarEstoque = async (id, atual, delta) => {
    const novaQtd = Math.max(0, atual + delta)
    const { error } = await sb.from('produtos').update({ quantidade: novaQtd }).eq('id', id)
    if (!error) {
      toast(`Estoque ajustado!`, '📦')
      carregarDados()
    }
  }

  const getSt = (q) => q <= 0 ? { class: 'badge-warning', label: 'ESGOTADO' } : q < 5 ? { class: 'badge-warning', label: 'BAIXO ESTOQUE' } : { class: 'badge-success', label: 'OTIMIZADO' }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>CARREGANDO INVENTÁRIO...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Hub de Inventário</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Auditória completa de ativos e volume físico.</p>
        </div>
        <div style={{ display: 'flex', gap: 24, background: '#FFF', padding: '12px 24px', border: '1px solid var(--border)', borderRadius: 6 }}>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>VOLUME TOTAL</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{produtos.reduce((a, b) => a + (b.quantidade || 0), 0)} <span style={{fontSize:10}}>UN</span></div>
           </div>
           <div style={{ width: 1, height: 32, background: 'var(--border)' }}></div>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>VALOR EM ESTOQUE</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>R$ {fmt(produtos.reduce((a, b) => a + (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0)), 0))}</div>
           </div>
        </div>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
           <span style={{ fontSize: 14 }}>🔍</span>
           <input 
             className="input-field" 
             style={{ border: 'none', background: 'transparent', width: 300, padding: 0 }}
             placeholder="Filtrar por nome ou sabor..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
        </div>

        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Modelo / Marca</th>
              <th>Especificação</th>
              <th>Investimento</th>
              <th>Preço Venda</th>
              <th>Puffs</th>
              <th>Volume</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ajuste</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map(p => {
              const st = getSt(p.quantidade)
              const investimento = parseFloat(p.custo || 0) * parseInt(p.quantidade || 0)
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.sabor || '—'}</td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>R$ {fmt(investimento)}</td>
                  <td style={{ fontWeight: 700 }}>R$ {fmt(p.preco_venda)}</td>
                  <td style={{ fontFamily: 'var(--font-tech)', fontSize: 11 }}>{p.puffs || '—'}</td>
                  <td style={{ fontSize: 14, fontWeight: 800 }}>{p.quantidade} <small style={{fontSize:9}}>UN</small></td>
                  <td>
                    <span className={`badge ${st.class}`}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                     <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => ajustarEstoque(p.id, p.quantidade, -1)} className="btn-outline" style={{ padding: '2px 8px', fontSize: 14 }}>-</button>
                        <button onClick={() => ajustarEstoque(p.id, p.quantidade, 1)} className="btn-outline" style={{ padding: '2px 8px', fontSize: 14 }}>+</button>
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
