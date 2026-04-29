import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Precos() {
  const { toast, setConfigData } = useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [editDesc, setEditDesc] = useState({}) // Cache local para descrições

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
        groups[p.nome] = { ...p, total_estoque: 0, linha: p.nome.toLowerCase().replace(/\s+/g, '_') }
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

  const salvarTudo = async () => {
    try {
      // 1. Salvar Preços
      const pPromises = modelosFiltrados.map(m => 
        sb.from('produtos').update({ preco_venda: m.preco_venda }).eq('nome', m.nome)
      )
      
      // 2. Salvar Descrições (na tabela config)
      const dPromises = Object.entries(editDesc).map(([linha, valor]) => 
        sb.from('config').upsert({ chave: `desc:${linha}`, valor })
      )

      await Promise.all([...pPromises, ...dPromises])
      toast('Configurações sincronizadas!', '💰')
      carregar()
    } catch (e) {
      toast('Erro ao sincronizar', '❌')
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>SINCRONIZANDO TABELA...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Matriz de Precificação</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Configuração global de valores e descrições para o catálogo.</p>
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
             placeholder="Buscar modelo..." 
             value={busca}
             onChange={e => setBusca(e.target.value)}
           />
        </div>

        <table className="data-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Status</th>
              <th>Descrição do Catálogo (Opcional)</th>
              <th style={{ textAlign: 'right' }}>Preço Venda (R$)</th>
            </tr>
          </thead>
          <tbody>
            {modelosFiltrados.map(m => (
              <tr key={m.nome}>
                <td style={{ fontWeight: 700, fontSize: 14 }}>{m.nome}</td>
                <td>
                   <span className={`badge ${m.total_estoque > 0 ? 'badge-success' : 'badge-warning'}`}>
                     {m.total_estoque} UN
                   </span>
                </td>
                <td>
                   <input 
                     className="input-field" 
                     style={{ fontSize: 11, padding: '4px 8px' }} 
                     placeholder="Breve descrição..."
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
