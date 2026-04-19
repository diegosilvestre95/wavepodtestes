import { useState, useCallback } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { eKey, fmt } from '../../lib/utils'

// ─── Item de compra ────────────────────────────────────────────────────────────
function CompraRow({ item, catalogo, produtosDB, estoqueMap, onChange, onRemove }) {
  const { nome, qtd, custo, precoVenda, puffs, sabores } = item

  const catExiste = catalogo.find(c => c.nome === nome)
  const saboresExist = [...new Set(
    produtosDB.filter(p => p.nome === nome).map(p => p.sabor || '').filter(Boolean)
  )]

  const preenchidos = sabores.filter(s => s.trim()).length
  const todos = qtd > 0 && preenchidos === qtd

  const handleNome = (v) => {
    const cat = catalogo.find(c => c.nome === v)
    const update = { nome: v }
    if (cat) {
      if (!puffs) update.puffs = cat.desc || ''
      if (!precoVenda) update.precoVenda = cat.preco ? cat.preco.toFixed(2) : ''
    }
    // regenera sabores com o tamanho atual
    update.sabores = Array(qtd).fill('').map((_, i) => sabores[i] || '')
    onChange(update)
  }

  const handleQtd = (v) => {
    const n = parseInt(v) || 0
    onChange({
      qtd: n,
      sabores: Array(n).fill('').map((_, i) => sabores[i] || ''),
    })
  }

  const handleSabor = (i, v) => {
    const next = [...sabores]
    next[i] = v
    onChange({ sabores: next })
  }

  return (
    <div className="compra-row">
      {/* Linha principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.8fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
        <div className="form-group">
          <label>Produto (modelo)</label>
          <input
            list={`ml-${item.id}`}
            type="text"
            placeholder="Ex: V80 Ignite, Elfbar..."
            autoComplete="off"
            value={nome}
            onChange={e => handleNome(e.target.value)}
          />
          <datalist id={`ml-${item.id}`}>
            {catalogo.map(c => <option key={c.linha} value={c.nome} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label>Qtd total</label>
          <input type="number" min="1" placeholder="0" value={qtd || ''}
            onChange={e => handleQtd(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Custo unit. (R$)</label>
          <input type="number" step="0.01" placeholder="0,00" value={custo}
            onChange={e => onChange({ custo: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Preço venda (R$) <small style={{ color: 'var(--muted)', fontSize: 10 }}>— vitrine</small></label>
          <input type="number" step="0.01" placeholder="90,00" value={precoVenda}
            onChange={e => onChange({ precoVenda: e.target.value })} />
        </div>
        <button className="btn-remove" style={{ alignSelf: 'flex-end' }} onClick={onRemove}>✕</button>
      </div>

      {/* Linha extra: puffs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 8 }}>
        <div className="form-group">
          <label>Puffs <small style={{ color: 'var(--muted)', fontSize: 10 }}>— obrigatório para novos modelos</small></label>
          <input type="text" placeholder="Ex: 8.000 puffs, 15.000 puffs..." value={puffs}
            onChange={e => onChange({ puffs: e.target.value })} />
        </div>
      </div>

      {/* Campos de sabor individuais */}
      {qtd > 0 && nome && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            Sabores por unidade
            <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, padding: '2px 8px', background: 'rgba(0,212,255,.1)', borderRadius: 20 }}>
              1 sabor por unidade
            </span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sabores.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 22, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                <input
                  list={`sl-${item.id}`}
                  type="text"
                  placeholder="Ex: Blueberry Lemon, Watermelon Ice..."
                  value={s}
                  onChange={e => handleSabor(i, e.target.value)}
                  autoComplete="off"
                  style={{ flex: 1 }}
                />
              </div>
            ))}
            <datalist id={`sl-${item.id}`}>
              {saboresExist.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
        </div>
      )}

      {/* Info de progresso */}
      <div style={{
        marginTop: 6, fontSize: 11, padding: '4px 10px',
        background: 'rgba(255,255,255,.03)', borderRadius: 6,
        color: todos ? 'var(--green)' : 'var(--muted)',
      }}>
        {!nome || !qtd
          ? '📦 Selecione modelo e quantidade para ver os campos de sabor'
          : todos
            ? `✅ Todos os ${qtd} sabores preenchidos para "${nome}"`
            : `📦 ${preenchidos}/${qtd} sabores preenchidos para "${nome}"`}
      </div>
    </div>
  )
}

// ─── Compras page ──────────────────────────────────────────────────────────────
let nextId = 1
const newItem = () => ({
  id: nextId++, nome: '', qtd: 0, custo: '', precoVenda: '', puffs: '', sabores: [],
})

export default function Compras() {
  const { catalogo, produtosDB, estoqueMap, carregarProdutos, setCatalogo, setConfigData, toast } = useApp()
  const [itens, setItens]   = useState([newItem()])
  const [frete, setFrete]   = useState('')
  const [loading, setLoading] = useState(false)

  const updateItem = (id, patch) => {
    setItens(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id) => setItens(prev => prev.filter(it => it.id !== id))
  const addItem    = () => setItens(prev => [...prev, newItem()])

  const totalQtd = itens.reduce((a, it) => a + (parseInt(it.qtd) || 0), 0)
  const totalVal = itens.reduce((a, it) =>
    a + (parseFloat(it.custo) || 0) * (parseInt(it.qtd) || 0), 0
  ) + (parseFloat(frete) || 0)

  const registrar = async () => {
    setLoading(true)
    const freteVal = parseFloat(frete) || 0
    const nomes = []
    let totalCompra = 0

    for (const item of itens) {
      const { nome, qtd: qtdRaw, puffs, sabores } = item
      const qtd = parseInt(qtdRaw) || 0
      const custo = parseFloat(item.custo) || 0
      const precoVenda = parseFloat(item.precoVenda) || 0
      if (!nome || !qtd || !custo) continue

      // Valida sabores
      const naoPreenchidos = sabores.filter(s => !s.trim()).length
      if (naoPreenchidos > 0) {
        toast(`Preencha todos os ${qtd} sabores de "${nome}"`, '⚠️')
        setLoading(false); return
      }

      const freteUnit = totalQtd > 0 ? freteVal / totalQtd : 0
      const custoFinal = custo + freteUnit

      // Gerencia catálogo
      const linhaKey = nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      const catExiste = catalogo.find(c => c.nome === nome)

      if (!catExiste) {
        if (!puffs) { toast(`Informe os Puffs do novo modelo "${nome}"`, '⚠️'); setLoading(false); return }
        const precoFinal = precoVenda > 0 ? precoVenda : 90.00
        setCatalogo(prev => [...prev, { linha: linhaKey, nome, desc: puffs, emoji: '💨', preco: precoFinal }])
        await sb.from('config').upsert({ chave: `desc:${linhaKey}`, valor: puffs }, { onConflict: 'chave' })
        await sb.from('config').upsert({ chave: `preco:${linhaKey}`, valor: precoFinal }, { onConflict: 'chave' })
        setConfigData(prev => ({ ...prev, [`desc:${linhaKey}`]: puffs, [`preco:${linhaKey}`]: precoFinal }))
      } else {
        if (precoVenda > 0) {
          setCatalogo(prev => prev.map(c => c.nome === nome ? { ...c, preco: precoVenda } : c))
          await sb.from('config').upsert({ chave: catExiste.linha, valor: precoVenda }, { onConflict: 'chave' })
        }
        if (puffs) {
          setCatalogo(prev => prev.map(c => c.nome === nome ? { ...c, desc: puffs } : c))
          await sb.from('config').upsert({ chave: `desc:${catExiste.linha}`, valor: puffs }, { onConflict: 'chave' })
        }
      }

      // Agrupa sabores iguais
      const contagem = {}
      sabores.forEach(s => { contagem[s] = (contagem[s] || 0) + 1 })

      // Upsert estoque (busca fresco para evitar race condition)
      const { data: prodsAtuais } = await sb.from('produtos').select('*').eq('nome', nome)
      for (const [sabor, qtdSabor] of Object.entries(contagem)) {
        const existing = (prodsAtuais || []).find(p => (p.sabor || '') === sabor)
        if (existing) {
          await sb.from('produtos').update({ quantidade: existing.quantidade + qtdSabor, custo: custoFinal }).eq('id', existing.id)
        } else {
          await sb.from('produtos').insert({ nome, sabor, quantidade: qtdSabor, custo: custoFinal })
        }
        nomes.push(`${nome} · ${sabor} (${qtdSabor}x)`)
      }
      totalCompra += custoFinal * qtd
    }

    if (!nomes.length) { toast('Preencha pelo menos um item completo', '⚠️'); setLoading(false); return }

    await sb.from('historico').insert({ tipo: 'Compra', descricao: nomes.join(', '), valor: totalCompra })
    await carregarProdutos()

    toast('✅ Compra registrada! Estoque e vitrine atualizados.')
    setItens([newItem()])
    setFrete('')
    setLoading(false)
  }

  return (
    <div className="container">
      <h2 className="section-title">Registrar compra</h2>
      <div className="card" style={{ maxWidth: 900 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
          Selecione o <strong style={{ color: 'var(--text)' }}>modelo</strong> e a <strong style={{ color: 'var(--text)' }}>quantidade</strong> — os campos de sabor aparecem automaticamente (1 por unidade). Puffs e preço são preenchidos automaticamente para modelos já cadastrados.
        </p>

        {itens.map(item => (
          <CompraRow
            key={item.id}
            item={item}
            catalogo={catalogo}
            produtosDB={produtosDB}
            estoqueMap={estoqueMap}
            onChange={patch => updateItem(item.id, patch)}
            onRemove={() => removeItem(item.id)}
          />
        ))}

        <button className="btn-ghost" onClick={addItem} style={{ marginTop: 4 }}>+ Adicionar item</button>
        <div className="divider" />

        <div className="form-grid fg-2">
          <div className="form-group">
            <label>Frete total (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={frete}
              onChange={e => setFrete(e.target.value)} />
          </div>
          <div className="stat-card" style={{ background: 'var(--surface2)', padding: '14px 18px' }}>
            <div className="stat-title">Total da compra</div>
            <div className="stat-value" style={{ fontSize: 20 }}>R$ {fmt(totalVal)}</div>
            <div className="stat-sub">
              Você · R${fmt(totalVal / 2)} &nbsp;|&nbsp; Sócio · R${fmt(totalVal / 2)}
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn-primary" onClick={registrar} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar compra ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
