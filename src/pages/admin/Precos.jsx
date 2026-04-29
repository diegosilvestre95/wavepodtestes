import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Precos() {
  const { toast } = useApp()
  const [modelos, setModelos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('nome, preco_venda, puffs').order('nome')
    const unique = []
    const names = new Set()
    data?.forEach(p => {
      if (!names.has(p.nome)) {
        names.add(p.nome)
        unique.push({ ...p, novo_preco: p.preco_venda })
      }
    })
    setModelos(unique)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const atualizarPreco = (nome, val) => {
    setModelos(prev => prev.map(m => m.nome === nome ? { ...m, novo_preco: val } : m))
  }

  const salvar = async () => {
    try {
      for (const m of modelos) {
        if (m.novo_preco !== m.preco_venda) {
          await sb.from('produtos').update({ preco_venda: m.novo_preco }).eq('nome', m.nome)
        }
      }
      toast('Preços atualizados no catálogo!', '💰')
      carregar()
    } catch (e) {
      toast('Erro ao salvar preços', '❌')
    }
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Sincronizando tabela de preços...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Preços do Catálogo</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Ajuste os valores de venda exibidos na vitrine em tempo real.</p>
        </div>
        <button className="btn-primary" onClick={salvar} style={{ padding: '12px 24px' }}>SALVAR ALTERAÇÕES ✓</button>
      </div>

      <div className="ipad-grid">
        {modelos.map(m => (
          <div key={m.nome} className="ipad-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 32 }}>💨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{m.nome}</div>
                <div style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>{m.puffs} PUFFS</div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 24, marginBottom: 0 }}>
              <label>Preço de Venda (R$)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--wp-yellow)' }}>R$</span>
                <input 
                  type="number" 
                  value={m.novo_preco} 
                  onChange={(e) => atualizarPreco(m.nome, e.target.value)}
                  style={{ paddingLeft: 45, fontWeight: 800, fontSize: 20 }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: 12, fontSize: 11, color: m.novo_preco !== m.preco_venda ? 'var(--wp-yellow)' : '#444', fontWeight: 700 }}>
              {m.novo_preco !== m.preco_venda ? '• ALTERAÇÃO PENDENTE' : '• PREÇO ATUALIZADO'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
