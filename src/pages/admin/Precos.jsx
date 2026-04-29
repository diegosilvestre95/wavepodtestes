import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'

export default function Precos() {
  const { toast } = useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [editDesc, setEditDesc] = useState({})

  const carregar = async () => {
    setLoading(true)
    const { data: produtos } = await sb.from('produtos').select('*')
    const { data: configs } = await sb.from('config').select('*')
    
    setData(produtos || [])
    
    const dCache = {}
    configs?.filter(c => c.chave.startsWith('desc:')).forEach(c => {
      dCache[c.chave.replace('desc:', '')] = c.valor
    })
    setEditDesc(dCache)
    
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const modelosFiltrados = useMemo(() => {
    const groups = {}
    data.forEach(p => {
      if (!groups[p.nome]) {
        groups[p.nome] = { 
          ...p, 
          total_estoque: 0, 
          custo_medio: 0, 
          count: 0,
          linha: p.nome.toLowerCase().replace(/\s+/g, '_') 
        }
      }
      groups[p.nome].total_estoque += (p.quantidade || 0)
      groups[p.nome].custo_medio += parseFloat(p.custo || 0)
      groups[p.nome].count++
    })
    
    return Object.values(groups)
      .map(g => ({ ...g, custo_medio: g.custo_medio / g.count }))
      .filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()))
  }, [data, busca])

  const atualizarLocal = (nome, val) => {
    setData(prev => prev.map(p => p.nome === nome ? { ...p, preco_venda: val } : p))
  }

  const salvarTudo = async () => {
    try {
      const pPromises = modelosFiltrados.map(m => 
        sb.from('produtos').update({ preco_venda: m.preco_venda }).eq('nome', m.nome)
      )
      const dPromises = Object.entries(editDesc).map(([linha, valor]) => 
        sb.from('config').upsert({ chave: `desc:${linha}`, valor })
      )
      await Promise.all([...pPromises, ...dPromises])
      toast('Sincronizado com sucesso!', '💰')
      carregar()
    } catch (e) {
      toast('Erro ao sincronizar', '❌')
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>CARREGANDO DADOS...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Matriz de Precificação</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Configuração global de valores, margens e descrições.</p>
        </div>
        <button className="btn-primary" onClick={salvarTudo} style={{ padding: '10px 24px' }}>
           SALVAR ALTERAÇÕES ✓
        </button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
           <span style={{ fontSize: 14 }}>🔍</span>
           <input 
             className="input-field" 
             style={{ border: 'none', background: 'transparent', width: 300, padding: 0 }}
             placeholder="Filtrar por modelo..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
        </div>

        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Custo Médio</th>
              <th>Margem Estimada</th>
              <th>Descrição do Catálogo</th>
              <th style={{ textAlign: 'right' }}>Preço Venda (R$)</th>
            </tr>
          </thead>
          <tbody>
            {modelosFiltrados.map(m => {
              const lucro = parseFloat(m.preco_venda) - m.custo_medio
              const margem = (lucro / parseFloat(m.preco_venda)) * 100
              return (
                <tr key={m.nome}>
                  <td style={{ fontWeight: 700 }}>{m.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>R$ {fmt(m.custo_medio)}</td>
                  <td>
                     <span className={`badge ${margem > 30 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                        {margem.toFixed(1)}% MARGEM
                     </span>
                  </td>
                  <td>
                     <input 
                       className="input-field" 
                       style={{ fontSize: 11, padding: '4px 8px', width: '90%' }} 
                       placeholder="Descrição..."
                       value={editDesc[m.linha] || ''}
                       onChange={e => setEditDesc({...editDesc, [m.linha]: e.target.value})}
                     />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ position: 'relative', width: 120 }}>
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
