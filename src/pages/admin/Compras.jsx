import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'

export default function Compras() {
  const { toast } = useApp()
  const [loading, setLoading] = useState(false)
  const [modelosExistentes, setModelosExistentes] = useState([])
  
  const [itens, setItens] = useState([
    { id: Date.now(), modelo: '', qtd: 0, custo: '', preco: '90', puffs: '', sabores: [] }
  ])
  const [frete, setFrete] = useState(0)

  // Carrega modelos já existentes para o datalist
  useEffect(() => {
    const fetchModelos = async () => {
      const { data } = await sb.from('produtos').select('nome')
      const unique = [...new Set(data?.map(i => i.nome))]
      setModelosExistentes(unique)
    }
    fetchModelos()
  }, [])

  const adicionarItem = () => {
    setItens([...itens, { id: Date.now(), modelo: '', qtd: 0, custo: '', preco: '90', puffs: '', sabores: [] }])
  }

  const removerItem = (id) => {
    if (itens.length > 1) setItens(itens.filter(i => i.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value }
        if (field === 'qtd') {
          const q = parseInt(value) || 0
          newItem.sabores = Array(q).fill('')
        }
        return newItem
      }
      return item
    }))
  }

  const updateSabor = (itemId, index, val) => {
    setItens(itens.map(item => {
      if (item.id === itemId) {
        const newSabores = [...item.sabores]
        newSabores[index] = val
        return { ...item, sabores: newSabores }
      }
      return item
    }))
  }

  const totalItens = itens.reduce((a, b) => a + (parseInt(b.qtd || 0) * parseFloat(b.custo || 0)), 0)
  const totalCompra = totalItens + parseFloat(frete || 0)
  const porSocio = totalCompra / 2

  const salvarCompra = async () => {
    setLoading(true)
    try {
      for (const item of itens) {
        if (!item.modelo || !item.qtd || item.sabores.some(s => !s)) {
          throw new Error(`Preencha todos os dados do modelo ${item.modelo || ''}`)
        }

        // Processa cada sabor individualmente (Sincronizado com Schema Real)
        for (const s of item.sabores) {
          const { data: p } = await sb.from('produtos').select('*').eq('nome', item.modelo).eq('sabor', s).single()

          if (p) {
            await sb.from('produtos').update({ 
              quantidade: p.quantidade + 1,
              custo: parseFloat(item.custo) // Nome conforme Schema: custo
            }).eq('id', p.id)
          } else {
            await sb.from('produtos').insert({
              nome: item.modelo,
              sabor: s,
              quantidade: 1,
              custo: item.custo
            })
          }
        }

        // Registra a transação em 'compras' (Colunas: nome, quantidade, custo, frete, sabor)
        await sb.from('compras').insert({
          nome: item.modelo,
          quantidade: item.qtd,
          custo: parseFloat(item.custo),
          frete: (parseFloat(frete) / itens.length),
          sabor: item.sabores.join(', ')
        })
      }
      toast('Compra registrada com sucesso!', '📥')
      setItens([{ id: Date.now(), modelo: '', qtd: 0, custo: '', preco: '90', puffs: '', sabores: [] }])
      setFrete(0)
    } catch (e) {
      toast(e.message, '❌')
    }
    setLoading(false)
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* DATALIST PARA SUGESTÃO DE MODELOS */}
      <datalist id="modelos-sugestao">
        {modelosExistentes.map(m => <option key={m} value={m} />)}
      </datalist>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Registrar compra</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Adicione cada item com produto, sabor e quantidade. O estoque é atualizado automaticamente.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {itens.map((item, idx) => {
          const preenchidos = item.sabores.filter(s => s.trim() !== '').length
          return (
            <div key={item.id} className="ipad-card" style={{ background: '#121212', border: '1px solid #1e1e22' }}>
              {itens.length > 1 && (
                <button onClick={() => removerItem(item.id)} style={{ position: 'absolute', right: 20, top: 20, color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 15, marginBottom: 20 }}>
                <div className="form-group">
                  <label>PRODUTO (MODELO)</label>
                  <input list="modelos-sugestao" type="text" placeholder="Ex: V80 Ignite, Elfbar..." value={item.modelo} onChange={e => updateItem(item.id, 'modelo', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>QTD TOTAL</label>
                  <input type="number" placeholder="0" value={item.qtd} onChange={e => updateItem(item.id, 'qtd', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>CUSTO UNIT. (R$)</label>
                  <input type="number" placeholder="0,00" value={item.custo} onChange={e => updateItem(item.id, 'custo', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>PREÇO VENDA (R$)</label>
                  <input type="number" value={item.preco} onChange={e => updateItem(item.id, 'preco', e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: '50%' }}>
                 <label>PUFFS — obrigatório para novos modelos</label>
                 <input type="text" placeholder="Ex: 8.000 puffs..." value={item.puffs} onChange={e => updateItem(item.id, 'puffs', e.target.value)} />
              </div>

              {item.sabores.length > 0 && (
                <div style={{ marginTop: 20, padding: 25, background: '#09090b', borderRadius: 16, border: '1px solid #18181b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                     <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b', textTransform: 'uppercase' }}>SABORES POR UNIDADE</div>
                     <div style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff', fontSize: 9, fontWeight: 900, padding: '4px 8px', borderRadius: '4px' }}>1 SABOR POR UNIDADE</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {item.sabores.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <span style={{ fontSize: 12, color: '#3f3f46', fontWeight: 800, width: 20 }}>{sIdx + 1}.</span>
                         <input type="text" placeholder="Ex: Blueberry Lemon, Watermelon Ice..." value={s} onChange={e => updateSabor(item.id, sIdx, e.target.value)} style={{ background: '#121212' }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 20, padding: '12px', background: '#111', borderRadius: '8px', fontSize: 11, color: '#444', fontWeight: 700 }}>
                     📦 {preenchidos}/{item.qtd} sabores preenchidos para "{item.modelo || '...'}"
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <button className="btn-action" onClick={adicionarItem} style={{ width: 'fit-content', padding: '12px 24px', borderStyle: 'dashed' }}>
          + Adicionar item
        </button>

        <div style={{ marginTop: 20, padding: '30px', background: 'var(--wp-bg-card)', borderRadius: 24, border: '1px solid #1e1e22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="form-group" style={{ width: 300, marginBottom: 0 }}>
             <label>FRETE TOTAL (R$)</label>
             <input type="number" placeholder="0,00" value={frete} onChange={e => setFrete(e.target.value)} />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b', marginBottom: 5 }}>TOTAL DA COMPRA</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>R$ {fmt(totalCompra)}</div>
            <div style={{ fontSize: 12, color: '#52525b' }}>
              Você - <span style={{ color: 'var(--wp-yellow)' }}>R$ {fmt(porSocio)}</span> | Sócio - <span style={{ color: 'var(--wp-yellow)' }}>R$ {fmt(porSocio)}</span>
            </div>
          </div>
        </div>

        <button 
          className="btn-primary" 
          disabled={loading}
          onClick={salvarCompra}
          style={{ 
            height: 56, fontSize: 13, fontWeight: 900,
            background: 'var(--wp-yellow)', 
            color: '#000', marginTop: 10, borderRadius: 12,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            border: 'none', cursor: 'pointer', width: '100%'
          }}
        >
          {loading ? 'PROCESSANDO...' : 'Registrar compra ✓'}
        </button>

      </div>
    </div>
  )
}
