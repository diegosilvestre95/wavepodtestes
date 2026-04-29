import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Compras() {
  const { toast } = useApp()
  const [modelos, setModelos] = useState([])
  const [itens, setItens]     = useState([{ modelo: '', puffs: '', preco: '', custo: '', qty: 1, sabores: [''] }])
  const [frete, setFrete]     = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await sb.from('produtos').select('nome, puffs, preco_venda').order('nome')
      const unique = []
      const names = new Set()
      data?.forEach(p => {
        if (!names.has(p.nome)) {
          names.add(p.nome)
          unique.push(p)
        }
      })
      setModelos(unique)
    }
    load()
  }, [])

  const addRow = () => setItens([...itens, { modelo: '', puffs: '', preco: '', custo: '', qty: 1, sabores: [''] }])
  const rmRow  = (idx) => setItens(itens.filter((_, i) => i !== idx))

  const updateItem = (idx, field, val) => {
    const next = [...itens]
    next[idx][field] = val
    if (field === 'modelo') {
      const mod = modelos.find(m => m.nome === val)
      if (mod) {
        next[idx].puffs = mod.puffs
        next[idx].preco = mod.preco_venda
      }
    }
    if (field === 'qty') {
      const q = parseInt(val) || 0
      next[idx].sabores = Array(q).fill('')
    }
    setItens(next)
  }

  const updateSabor = (iIdx, sIdx, val) => {
    const next = [...itens]
    next[iIdx].sabores[sIdx] = val
    setItens(next)
  }

  const totalCompra = itens.reduce((a, i) => a + (parseFloat(i.custo) || 0) * (parseInt(i.qty) || 0), 0) + (parseFloat(frete) || 0)

  const registrar = async () => {
    if (itens.some(i => !i.modelo || !i.custo || !i.qty)) return toast('Preencha todos os campos obrigatórios', '⚠️')
    setLoading(true)

    try {
      for (const item of itens) {
        const proms = item.sabores.map(sabor => 
          sb.from('produtos').insert({
            nome: item.modelo,
            puffs: item.puffs,
            preco_venda: item.preco,
            custo_unitario: item.custo,
            sabor: sabor.trim() || 'Sem Sabor',
            quantidade: 1,
            linha: item.modelo.toLowerCase().replace(/\s+/g, '-')
          })
        )
        await Promise.all(proms)
      }
      await sb.from('historico').insert({ tipo: 'Compra', valor: totalCompra, descricao: `Entrada de ${itens.length} modelos` })
      toast('Estoque atualizado com sucesso!', '✅')
      setItens([{ modelo: '', puffs: '', preco: '', custo: '', qty: 1, sabores: [''] }])
      setFrete(0)
    } catch (e) {
      toast('Erro ao registrar compra', '❌')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-wrapper" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: '-0.02em' }}>Registrar Entrada</h1>
        <p style={{ color: '#888', fontSize: 14 }}>Adicione novos produtos ao inventário e atualize o custo operacional.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        
        <div>
          {itens.map((item, idx) => (
            <div key={idx} className="item-row-card">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Modelo / Produto</label>
                  <input list="models" value={item.modelo} onChange={e => updateItem(idx, 'modelo', e.target.value)} placeholder="Ex: V80 Ignite" />
                  <datalist id="models">
                    {modelos.map(m => <option key={m.nome} value={m.nome} />)}
                  </datalist>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Qtd Total</label>
                  <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Custo Unit. (R$)</label>
                  <input type="number" value={item.custo} onChange={e => updateItem(idx, 'custo', e.target.value)} placeholder="0,00" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Preço Venda (R$)</label>
                  <input type="number" value={item.preco} onChange={e => updateItem(idx, 'preco', e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Puffs (Capacidade)</label>
                <input value={item.puffs} onChange={e => updateItem(idx, 'puffs', e.target.value)} placeholder="Ex: 8.000 puffs" />
              </div>

              <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 12 }}>SABORES POR UNIDADE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {item.sabores.map((s, sIdx) => (
                    <input key={sIdx} value={s} onChange={e => updateSabor(idx, sIdx, e.target.value)} placeholder={`Sabor item ${sIdx + 1}`} style={{ background: '#fff', fontSize: 12, padding: '10px' }} />
                  ))}
                </div>
              </div>

              {itens.length > 1 && (
                <button onClick={() => rmRow(idx)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 800 }}>REMOVER</button>
              )}
            </div>
          ))}

          <button className="btn-action" onClick={addRow} style={{ marginTop: 8 }}>
             <span>+</span> ADICIONAR OUTRO MODELO
          </button>
        </div>

        <div className="stat-card-premium" style={{ position: 'sticky', top: 100 }}>
          <div className="stat-label">Resumo da Operação</div>
          
          <div className="form-group" style={{ marginTop: 24 }}>
            <label>Custo de Frete (R$)</label>
            <input type="number" value={frete} onChange={e => setFrete(e.target.value)} />
          </div>

          <div style={{ marginTop: 32, padding: '24px 0', borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>INVESTIMENTO TOTAL</div>
            <div className="stat-main-val" style={{ fontSize: 32 }}>R$ {totalCompra.toFixed(2).replace('.', ',')}</div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: 20 }} disabled={loading} onClick={registrar}>
            {loading ? 'PROCESSANDO...' : 'REGISTRAR COMPRA ✓'}
          </button>
        </div>

      </div>
    </div>
  )
}
