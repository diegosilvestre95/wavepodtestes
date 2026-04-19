import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'

export default function Vendas() {
  const { produtosDB, catalogo, carregarProdutos, toast } = useApp()

  const [produtoId, setProdutoId] = useState('')
  const [qtd, setQtd]             = useState('')
  const [preco, setPreco]         = useState('')
  const [loading, setLoading]     = useState(false)

  const disponiveis = produtosDB.filter(p => (p.quantidade || 0) > 0)

  const prodSel = disponiveis.find(p => p.id === produtoId)
  const custoSel = prodSel ? parseFloat(prodSel.custo || 0) : 0

  // Preenche preço ao selecionar produto
  useEffect(() => {
    if (!prodSel) return
    const cat = catalogo.find(c => c.nome === prodSel.nome)
    if (cat) setPreco(cat.preco.toFixed(2))
  }, [produtoId]) // eslint-disable-line

  const q = parseFloat(qtd) || 0
  const p = parseFloat(preco) || 0
  const receita = q * p
  const custo   = q * custoSel
  const lucro   = receita - custo
  const showPreview = q > 0 && p > 0

  const registrar = async () => {
    if (!produtoId || !qtd || !preco) return toast('Preencha todos os campos', '⚠️')
    const maxEst = prodSel?.quantidade || 0
    if (q > maxEst) return toast(`Estoque insuficiente. Disponível: ${maxEst}`, '⚠️')

    setLoading(true)
    const { error } = await sb.from('vendas').insert({
      produto_id: produtoId,
      quantidade: q,
      preco_venda: p,
      nome_produto: prodSel.nome,
      sabor_produto: prodSel.sabor || '',
      data: new Date().toISOString(),
    })
    if (error) { toast('Erro ao registrar venda', '⚠️'); setLoading(false); return }

    const { data: prod } = await sb.from('produtos').select('quantidade').eq('id', produtoId).single()
    await sb.from('produtos').update({ quantidade: (prod?.quantidade || 0) - q }).eq('id', produtoId)
    await sb.from('historico').insert({
      tipo: 'Venda',
      descricao: `${prodSel.nome}${prodSel.sabor ? ' · ' + prodSel.sabor : ''} (${q}x · R$${p.toFixed(2)})`,
      valor: p * q,
    })

    await carregarProdutos()
    setProdutoId(''); setQtd(''); setPreco('')
    toast('Venda registrada! Estoque e dashboard atualizados.')
    setLoading(false)
  }

  return (
    <div className="container">
      <h2 className="section-title">Registrar venda manual</h2>
      <div className="card" style={{ maxWidth: 640 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
          Selecione o produto e sabor. O estoque é decrementado e o lucro atualizado automaticamente.
        </p>

        <div className="form-grid fg-3">
          <div className="form-group">
            <label>Produto · Sabor</label>
            <select value={produtoId} onChange={e => setProdutoId(e.target.value)}>
              <option value="">— Selecione produto / sabor —</option>
              {disponiveis.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}{p.sabor ? ' · ' + p.sabor : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantidade</label>
            <input type="number" min="1" placeholder="0" value={qtd}
              onChange={e => setQtd(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Preço unit. venda (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={preco}
              onChange={e => setPreco(e.target.value)} />
          </div>
        </div>

        {showPreview && (
          <div className="preview-grid" style={{ display: 'grid' }}>
            <div className="preview-item">
              <div className="preview-label">Receita</div>
              <div className="preview-value">R${fmt(receita)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Custo est.</div>
              <div className="preview-value red">R${fmt(custo)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Lucro</div>
              <div className={`preview-value ${lucro >= 0 ? 'green' : 'red'}`}>R${fmt(lucro)}</div>
            </div>
          </div>
        )}

        <div className="btn-row">
          <button className="btn-primary" onClick={registrar} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar venda ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
