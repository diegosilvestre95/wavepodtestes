import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import { useApp } from '../../context/AppContext'

export default function Compras() {
  const { toast } = useApp()
  const [produtos, setProdutos] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(false)
  const [freteTotal, setFreteTotal] = useState(0)

  // Estado para múltiplos itens na mesma compra
  const [itens, setItens] = useState([
    { id: Date.now(), nome: '', quantidade: 0, custo: 0, preco_venda: 90, puffs: '', sabores: [] }
  ])

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    const [p, c] = await Promise.all([
      sb.from('produtos').select('*').order('nome'),
      sb.from('compras').select('*').order('data', { ascending: false })
    ])
    setProdutos(p.data || [])
    setCompras(c.data || [])
  }

  const adicionarItem = () => {
    setItens([...itens, { id: Date.now(), nome: '', quantidade: 0, custo: 0, preco_venda: 90, puffs: '', sabores: [] }])
  }

  const removerItem = (id) => {
    if (itens.length > 1) setItens(itens.filter(i => i.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItens(itens.map(item => {
      if (item.id !== id) return item
      
      let newItem = { ...item, [field]: value }
      
      // Se mudar a quantidade, regenera o array de sabores
      if (field === 'quantidade') {
        const qtd = parseInt(value) || 0
        const novosSabores = Array(qtd).fill('').map((_, idx) => item.sabores[idx] || '')
        newItem.sabores = novosSabores
      }
      
      return newItem
    }))
  }

  const updateSabor = (itemId, idx, valor) => {
    setItens(itens.map(item => {
      if (item.id !== itemId) return item
      const novos = [...item.sabores]
      novos[idx] = valor
      return { ...item, sabores: novos }
    }))
  }

  const totalCompra = useMemo(() => {
    const subtotal = itens.reduce((a, b) => a + (parseFloat(b.custo || 0) * (parseInt(b.quantidade) || 0)), 0)
    return subtotal + parseFloat(freteTotal || 0)
  }, [itens, freteTotal])

  const canSubmit = useMemo(() => {
    return itens.every(it => 
      it.nome && 
      it.quantidade > 0 && 
      it.custo > 0 && 
      it.sabores.length === it.quantidade && 
      it.sabores.every(s => s.trim() !== '')
    )
  }, [itens])

  const finalizarCompra = async () => {
    if (!canSubmit) return
    setLoading(true)

    try {
      for (const it of itens) {
        // Processar cada sabor individualmente (cada um vira um registro ou update no estoque)
        for (const sabor of it.sabores) {
          const { data: existente } = await sb.from('produtos')
            .select('*')
            .eq('nome', it.nome)
            .eq('sabor', sabor)
            .single()

          if (existente) {
            await sb.from('produtos').update({ 
              quantidade: (existente.quantidade || 0) + 1, 
              custo: parseFloat(it.custo),
              preco_venda: parseFloat(it.preco_venda)
            }).eq('id', existente.id)
          } else {
            await sb.from('produtos').insert([{
              nome: it.nome,
              sabor: sabor,
              quantidade: 1,
              custo: parseFloat(it.custo),
              preco_venda: parseFloat(it.preco_venda),
              puffs: it.puffs,
              linha: it.nome.toLowerCase().replace(/\s+/g, '_')
            }])
          }
        }

        // Registrar Log da Compra
        await sb.from('compras').insert([{
          nome: it.nome,
          sabor: it.sabores.join(', '),
          quantidade: it.quantidade,
          custo: parseFloat(it.custo),
          frete: parseFloat(freteTotal) / itens.length, // Rateio simples do frete
          data: new Date().toISOString()
        }])
      }

      toast('Compra registrada e estoque atualizado!', '📥')
      setItens([{ id: Date.now(), nome: '', quantidade: 0, custo: 0, preco_venda: 90, puffs: '', sabores: [] }])
      setFreteTotal(0)
      carregarDados()
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const sugestoesNomes = [...new Set(produtos.map(p => p.nome))]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Registrar Compra</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Adicione cada item com produto, sabor (texto livre) e quantidade. O estoque é atualizado automaticamente.</p>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 12, padding: 32, marginBottom: 32 }}>
        
        {itens.map((item, idx) => (
          <div key={item.id} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: idx < itens.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="kpi-title" style={{ fontSize: 10 }}>PRODUTO (MODELO)</label>
                <input 
                  className="input-field" 
                  list="nomes-produtos"
                  placeholder="Ex: V80 Ignite, Elfbar..."
                  value={item.nome}
                  onChange={e => updateItem(item.id, 'nome', e.target.value)}
                />
              </div>
              <div>
                <label className="kpi-title" style={{ fontSize: 10 }}>QTD TOTAL</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={item.quantidade}
                  onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
                />
              </div>
              <div>
                <label className="kpi-title" style={{ fontSize: 10 }}>CUSTO UNIT. (R$)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={item.custo}
                  onChange={e => updateItem(item.id, 'custo', e.target.value)}
                />
              </div>
              <div>
                <label className="kpi-title" style={{ fontSize: 10 }}>PREÇO VENDA (R$)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={item.preco_venda}
                  onChange={e => updateItem(item.id, 'preco_venda', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  onClick={() => removerItem(item.id)}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, width: 40, height: 38, cursor: 'pointer', fontWeight: 800 }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
               <label className="kpi-title" style={{ fontSize: 10 }}>PUFFS — obrigatório para novos modelos</label>
               <input 
                 className="input-field" 
                 placeholder="Ex: 8.000 puffs, 15.000 puffs..."
                 value={item.puffs}
                 onChange={e => updateItem(item.id, 'puffs', e.target.value)}
               />
            </div>

            {item.quantidade > 0 ? (
              <div style={{ background: '#F9FAFB', padding: 20, borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                   <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{item.quantidade} SABOR{item.quantidade > 1 ? 'ES' : ''} POR UNIDADE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {item.sabores.map((s, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', width: 20 }}>{sIdx + 1}.</span>
                       <input 
                         className="input-field" 
                         placeholder="Digite o sabor desta unidade..."
                         value={s}
                         onChange={e => updateSabor(item.id, sIdx, e.target.value)}
                       />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                   📦 {item.sabores.filter(s => s.trim() !== '').length}/{item.quantidade} sabores preenchidos para "{item.nome || '...'}"
                </div>
              </div>
            ) : (
              <div style={{ background: '#F9FAFB', padding: 12, borderRadius: 8, border: '1px dashed var(--border)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                 Selecione modelo e quantidade para habilitar os campos de sabor
              </div>
            )}
          </div>
        ))}

        <button className="btn-outline" onClick={adicionarItem} style={{ marginBottom: 32 }}>
          + Adicionar item
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid var(--bg-app)', paddingTop: 32 }}>
           <div style={{ width: 300 }}>
              <label className="kpi-title" style={{ fontSize: 10 }}>FRETE TOTAL (R$)</label>
              <input 
                type="number" 
                className="input-field" 
                value={freteTotal}
                onChange={e => setFreteTotal(e.target.value)}
              />
           </div>

           <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#111827', color: '#FFF', padding: '24px 40px', borderRadius: 12, minWidth: 320 }}>
                 <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--wp-yellow)', marginBottom: 8 }}>TOTAL DA COMPRA</div>
                 <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>R$ {fmt(totalCompra)}</div>
                 <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    Você R$ {fmt(totalCompra/2)} | Sócio R$ {fmt(totalCompra/2)}
                 </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: 16, width: '100%', height: 56, fontSize: 14 }}
                disabled={!canSubmit || loading}
                onClick={finalizarCompra}
              >
                {loading ? 'PROCESSANDO...' : 'CONFIRMAR ENTRADA'}
              </button>
           </div>
        </div>
      </div>

      <datalist id="nomes-produtos">
        {sugestoesNomes.map(n => <option key={n} value={n} />)}
      </datalist>
    </div>
  )
}
