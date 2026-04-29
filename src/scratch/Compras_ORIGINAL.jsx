import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'

export default function Compras() {
  const { toast } = useApp()
  const [loading, setLoading] = useState(false)
  
  // Estado para m├║ltiplos itens na mesma compra
  const [itens, setItens] = useState([
    { id: Date.now(), modelo: '', qtd: 0, custo: '', preco: '90', puffs: '', sabores: [] }
  ])
  const [frete, setFrete] = useState(0)

  // Adicionar novo bloco de item
  const adicionarItem = () => {
    setItens([...itens, { id: Date.now(), modelo: '', qtd: 0, custo: '', preco: '90', puffs: '', sabores: [] }])
  }

  // Remover bloco de item
  const removerItem = (id) => {
    if (itens.length > 1) setItens(itens.filter(i => i.id !== id))
  }

  // Atualizar campos de um item espec├¡fico
  const updateItem = (id, field, value) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value }
        // Se mudar a quantidade, gera os campos de sabores
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

  // C├ílculos ERP
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

        // Processa cada sabor individualmente (L├│gica Relacional do Banco)
        for (const s of item.sabores) {
          const { data: p } = await sb.from('produtos').select('*').eq('nome', item.modelo).eq('sabor', s).single()

          if (p) {
            await sb.from('produtos').update({ 
              quantidade: p.quantidade + 1,
              custo_unitario: parseFloat(item.custo),
              preco_venda: parseFloat(item.preco),
              puffs: item.puffs
            }).eq('id', p.id)
          } else {
            await sb.from('produtos').insert({
              nome: item.modelo,
              sabor: s,
              quantidade: 1,
              custo_unitario: item.custo,
              preco_venda: item.preco,
              puffs: item.puffs
            })
          }
        }

        // Registra a transa├º├úo individual na tabela de Compras para o Dashboard
        await sb.from('compras').insert({
          produto_nome: item.modelo,
          quantidade: item.qtd,
          investimento_total: (item.qtd * item.custo) + (parseFloat(frete) / itens.length)
        })
      }

      toast('Compra registrada e estoque atualizado!', '­ƒôÑ')
      setItens([{ id: Date.now(), modelo: '', qtd: 0, custo: '', preco: '90', puffs: '', sabores: [] }])
      setFrete(0)
    } catch (e) {
      toast(e.message || 'Erro ao registrar compra', 'ÔØî')
    }
    setLoading(false)
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Registrar compra</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Adicione cada item com produto, sabor e quantidade. O estoque ├® atualizado automaticamente.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {itens.map((item, idx) => (
          <div key={item.id} className="ipad-card" style={{ background: '#121212', position: 'relative' }}>
            {itens.length > 1 && (
              <button onClick={() => removerItem(item.id)} style={{ position: 'absolute', right: 20, top: 20, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>Ô£ò</button>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 15, marginBottom: 20 }}>
              <div className="form-group">
                <label>PRODUTO (MODELO)</label>
                <input type="text" placeholder="Ex: V80 Ignite, Elfbar..." value={item.modelo} onChange={e => updateItem(item.id, 'modelo', e.target.value)} />
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
                <label>PRE├çO VENDA (R$)</label>
                <input type="number" value={item.preco} onChange={e => updateItem(item.id, 'preco', e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: '50%' }}>
               <label>PUFFS ÔÇö obrigat├│rio para novos modelos</label>
               <input type="text" placeholder="Ex: 8.000 puffs..." value={item.puffs} onChange={e => updateItem(item.id, 'puffs', e.target.value)} />
            </div>

            {item.sabores.length > 0 && (
              <div style={{ marginTop: 20, padding: 20, background: '#09090b', borderRadius: 12, border: '1px solid #1e1e22' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b', marginBottom: 15 }}>SABORES DO ITEM {idx + 1}:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {item.sabores.map((s, sIdx) => (
                    <input key={sIdx} type="text" placeholder={`Sabor ${sIdx + 1}`} value={s} onChange={e => updateSabor(item.id, sIdx, e.target.value)} style={{ height: 40, fontSize: 12 }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <button className="btn-action" onClick={adicionarItem} style={{ width: 'fit-content', padding: '12px 24px' }}>
          + Adicionar item
        </button>

        <div style={{ borderTop: '1px solid #18181b', paddingTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ width: 300, marginBottom: 0 }}>
             <label>FRETE TOTAL (R$)</label>
             <input type="number" placeholder="0,00" value={frete} onChange={e => setFrete(e.target.value)} />
          </div>

          <div className="ipad-card" style={{ width: 400, padding: 24, marginBottom: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b' }}>TOTAL DA COMPRA</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>R$ {fmt(totalCompra)}</div>
            <div style={{ fontSize: 12, color: '#52525b', marginTop: 5 }}>
              Voc├¬ - <span style={{ color: 'var(--wp-yellow)' }}>R$ {fmt(porSocio)}</span> | S├│cio - <span style={{ color: 'var(--wp-yellow)' }}>R$ {fmt(porSocio)}</span>
            </div>
          </div>
        </div>

        <button 
          className="btn-primary" 
          disabled={loading}
          onClick={salvarCompra}
          style={{ 
            height: 60, fontSize: 16, 
            background: 'linear-gradient(90deg, #00d2ff 0%, #928dab 100%)', 
            color: '#fff', marginTop: 20 
          }}
        >
          {loading ? 'PROCESSANDO...' : 'Registrar compra Ô£ô'}
        </button>

      </div>
    </div>
  )
}
