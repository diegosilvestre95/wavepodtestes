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

  // Agrupamento por Modelo e Filtro de Busca
  const modelosFiltrados = useMemo(() => {
    const groups = {}
    data.forEach(p => {
      if (!groups[p.nome]) {
        groups[p.nome] = { ...p, total_estoque: 0 }
      }
      groups[p.nome].total_estoque += p.quantidade
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

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Carregando catálogo mestre...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Preços do Catálogo</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Gestão centralizada de valores para vitrine.</p>
        </div>
        <button className="btn-primary" onClick={salvarModelos} style={{ 
          padding: '12px 32px',
          background: 'linear-gradient(90deg, #00d2ff 0%, #928dab 100%)',
          color: '#fff', fontWeight: 900, border: 'none', borderRadius: '12px'
        }}>SALVAR ALTERAÇÕES ✓</button>
      </div>

      <div className="ipad-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* BARRA DE BUSCA INTEGRADA */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #18181b', display: 'flex', alignItems: 'center', gap: 15 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Buscar por modelo (Ex: Ignite, Elfbar...)" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ background: 'transparent', border: 'none', fontSize: 16, padding: 0, width: '100%', fontWeight: 500 }}
          />
        </div>

        <div className="premium-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: 30 }}>MODELO / PRODUTO</th>
                <th>ESPECIFICAÇÃO</th>
                <th>ESTOQUE DISPONÍVEL</th>
                <th style={{ textAlign: 'right', paddingRight: 30 }}>PREÇO DE VENDA (R$)</th>
              </tr>
            </thead>
            <tbody>
              {modelosFiltrados.map(m => (
                <tr key={m.nome}>
                  <td style={{ paddingLeft: 30 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{m.nome}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#52525b' }}>{m.puffs} PUFFS</div>
                  </td>
                  <td>
                    <div className="status-pill" style={{ color: m.total_estoque > 0 ? '#10b981' : '#ef4444' }}>
                      <div className="status-dot" style={{ background: m.total_estoque > 0 ? '#10b981' : '#ef4444' }}></div>
                      {m.total_estoque} UNIDADES EM ESTOQUE
                    </div>
                  </td>
                  <td style={{ paddingRight: 30 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ position: 'relative', width: 160 }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--wp-yellow)', fontSize: 14 }}>R$</span>
                        <input 
                          type="number" 
                          value={m.preco_venda} 
                          onChange={(e) => atualizarLocal(m.nome, e.target.value)}
                          style={{ paddingLeft: 45, fontWeight: 800, fontSize: 18, background: '#09090b', height: 48, borderRadius: 10 }}
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
    </div>
  )
}
