import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'

export default function Vendas() {
  const { toast } = useApp()
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState('')
  const [qty, setQty] = useState(1)
  const [preco, setPreco] = useState('')

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('*').gt('quantidade', 0).order('nome')
    setEstoque(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const onSelect = (id) => {
    const p = estoque.find(i => i.id === id)
    if (p) {
      setSel(id)
      setPreco(p.preco_venda)
    }
  }

  const registrar = async () => {
    if (!sel || !qty || !preco) return toast('Preencha todos os campos', '⚠️')
    const p = estoque.find(i => i.id === sel)
    
    const { error } = await sb.from('produtos').update({ quantidade: p.quantidade - qty }).eq('id', sel)
    if (error) return toast('Erro ao atualizar estoque', '❌')

    await sb.from('vendas').insert({
      produto_id: sel,
      quantidade: qty,
      preco_venda: preco,
      lucro: (preco - p.custo_unitario) * qty
    })

    toast('Venda registrada com sucesso!', '💸')
    setSel('')
    setQty(1)
    setPreco('')
    carregar()
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Consultando estoque disponível...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Venda Manual</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Registre vendas diretas e baixe o estoque instantaneamente.</p>
      </div>

      <div className="ipad-card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label>Produto & Sabor</label>
          <select value={sel} onChange={e => onSelect(e.target.value)}>
            <option value="">— Selecione um item em estoque —</option>
            {estoque.map(p => (
              <option key={p.id} value={p.id}>
                {p.nome} - {p.sabor} ({p.quantidade} un)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="form-group">
            <label>Quantidade</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Preço Unit. (R$)</label>
            <input type="number" value={preco} onChange={e => setPreco(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 24, background: '#121212', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', textTransform: 'uppercase' }}>Valor Total</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(qty * preco)}</div>
          </div>
          <button className="btn-primary" onClick={registrar}>FINALIZAR VENDA ✓</button>
        </div>
      </div>
    </div>
  )
}
