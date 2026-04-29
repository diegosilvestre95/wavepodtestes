import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Precos() {
  const { toast } = useApp()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    // Busca direta para garantir que todos os produtos apareçam
    const { data, error } = await sb.from('produtos').select('*').order('nome')
    if (error) {
      console.error(error)
      toast('Erro ao carregar catálogo', '❌')
    }
    setProdutos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const atualizarLocal = (id, val) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, preco_venda: val } : p))
  }

  const salvarTudo = async () => {
    try {
      const updates = produtos.map(p => 
        sb.from('produtos').update({ preco_venda: p.preco_venda }).eq('id', p.id)
      )
      await Promise.all(updates)
      toast('Tabela de preços sincronizada!', '💰')
      carregar()
    } catch (e) {
      toast('Erro ao salvar alterações', '❌')
    }
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Lendo catálogo de produtos...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Preços do Catálogo</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Ajuste os valores de venda exibidos na vitrine para os clientes.</p>
        </div>
        <button className="btn-primary" onClick={salvarTudo} style={{ padding: '12px 24px' }}>SALVAR ALTERAÇÕES ✓</button>
      </div>

      <div className="ipad-grid">
        {produtos.length === 0 && <div style={{ color: '#444' }}>Nenhum produto encontrado no catálogo.</div>}
        {produtos.map(p => (
          <div key={p.id} className="ipad-card" style={{ padding: '24px', border: '1px solid #18181b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
               <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--wp-yellow)', marginBottom: 4 }}>{p.sabor?.toUpperCase() || 'SABOR ÚNICO'}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: '#52525b' }}>{p.puffs} Puffs</div>
               </div>
               <div style={{ background: '#121212', padding: '8px', borderRadius: '8px', border: '1px solid #1e1e22' }}>
                  📦 {p.quantidade} un
               </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Preço de Venda (R$)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--wp-yellow)' }}>R$</span>
                <input 
                  type="number" 
                  value={p.preco_venda} 
                  onChange={(e) => atualizarLocal(p.id, e.target.value)}
                  style={{ paddingLeft: 45, fontWeight: 800, fontSize: 18, background: '#09090b', height: 52 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
