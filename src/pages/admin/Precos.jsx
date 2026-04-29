import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Precos() {
  const { toast } = useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const { data: produtos } = await sb.from('produtos').select('*')
    setData(produtos || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  // AGRUPAMENTO: Agrupa variações de sabor em um único Modelo para ajuste de preço global
  const modelos = useMemo(() => {
    const groups = {}
    data.forEach(p => {
      if (!groups[p.nome]) {
        groups[p.nome] = { ...p, total_estoque: 0 }
      }
      groups[p.nome].total_estoque += p.quantidade
    })
    return Object.values(groups)
  }, [data])

  const atualizarLocal = (nome, val) => {
    setData(prev => prev.map(p => p.nome === nome ? { ...p, preco_venda: val } : p))
  }

  const salvarModelos = async () => {
    try {
      // Atualiza todos os produtos que possuem o mesmo nome (independente do sabor)
      const promises = modelos.map(m => 
        sb.from('produtos').update({ preco_venda: m.preco_venda }).eq('nome', m.nome)
      )
      await Promise.all(promises)
      toast('Preços do catálogo atualizados!', '💰')
      carregar()
    } catch (e) {
      toast('Erro ao sincronizar preços', '❌')
    }
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Sincronizando modelos de catálogo...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Preços do Catálogo</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Ajuste o valor global de cada modelo. Isso afetará todos os sabores simultaneamente.</p>
        </div>
        <button className="btn-primary" onClick={salvarModelos} style={{ 
          padding: '12px 24px',
          background: 'linear-gradient(90deg, #00d2ff 0%, #928dab 100%)',
          color: '#fff',
          fontWeight: 900,
          border: 'none',
          borderRadius: '12px'
        }}>SALVAR ALTERAÇÕES ✓</button>
      </div>

      <div className="ipad-grid">
        {modelos.map(m => (
          <div key={m.nome} className="ipad-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
               <div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{m.nome}</div>
                  <div style={{ fontSize: 12, color: '#52525b', fontWeight: 600 }}>{m.puffs} PUFFS</div>
               </div>
               <div style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--wp-yellow)', padding: '10px 16px', borderRadius: '12px', fontSize: 12, fontWeight: 800 }}>
                  ESTOQUE TOTAL: {m.total_estoque} un
               </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Preço de Venda Sugerido (R$)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--wp-yellow)' }}>R$</span>
                <input 
                  type="number" 
                  value={m.preco_venda} 
                  onChange={(e) => atualizarLocal(m.nome, e.target.value)}
                  style={{ paddingLeft: 45, fontWeight: 800, fontSize: 24, background: '#09090b', height: 64 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
