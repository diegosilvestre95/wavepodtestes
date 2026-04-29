import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Vendas() {
  const [produtos, setProdutos] = useState([])
  const [vendas, setVendas] = useState([])
  const [form, setForm] = useState({ produtoId: '', quantidade: 1, preco_venda: '' })
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    const [p, v] = await Promise.all([
      sb.from('produtos').select('*').order('nome'),
      sb.from('vendas').select('*').order('data', { ascending: false })
    ])
    setProdutos(p.data || [])
    setVendas(v.data || [])
  }

  const prodFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (p.sabor || '').toLowerCase().includes(busca.toLowerCase())
  )

  const handleVenda = async (e) => {
    e.preventDefault()
    if (!form.produtoId || !form.preco_venda) return
    setLoading(true)
    const p = produtos.find(i => i.id === parseInt(form.produtoId))
    
    try {
      await sb.from('vendas').insert([{
        produto_id: p.id, nome_produto: p.nome, sabor_produto: p.sabor,
        quantidade: parseInt(form.quantidade), preco_venda: parseFloat(form.preco_venda),
        data: new Date().toISOString()
      }])
      await sb.from('produtos').update({ quantidade: p.quantidade - parseInt(form.quantidade) }).eq('id', p.id)
      setForm({ produtoId: '', quantidade: 1, preco_venda: '' }); setBusca(''); carregarDados()
    } catch (err) { alert(err.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginBottom: 24 }}>Nova Venda</h3>
        <form onSubmit={handleVenda}>
          <div style={{ marginBottom: 16 }}>
            <label className="stat-label">Buscar Produto</label>
            <input className="input-field" placeholder="Nome ou sabor..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="stat-label">Selecionar</label>
            <select className="input-field" value={form.produtoId} onChange={e => {
              const p = produtos.find(i => i.id === parseInt(e.target.value))
              setForm({...form, produtoId: e.target.value, preco_venda: p?.preco_venda || ''})
            }}>
              <option value="">— Selecione —</option>
              {prodFiltrados.map(p => (
                <option key={p.id} value={p.id}>{p.nome} {p.sabor} ({p.quantidade} un)</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12, marginBottom: 24 }}>
            <div>
              <label className="stat-label">Qtd</label>
              <input type="number" className="input-field" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
            </div>
            <div>
              <label className="stat-label">Preço (R$)</label>
              <input type="number" step="0.01" className="input-field" value={form.preco_venda} onChange={e => setForm({...form, preco_venda: e.target.value})} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'PROCESSANDO...' : 'FINALIZAR VENDA'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 24 }}>Histórico</h3>
        <table className="table-container">
          <thead>
            <tr><th>Produto</th><th>Qtd</th><th>Unitário</th><th>Total</th><th>Data</th></tr>
          </thead>
          <tbody>
            {vendas.slice(0, 15).map(v => (
              <tr key={v.id}>
                <td><strong>{v.nome_produto}</strong><br/><small style={{color:'var(--text-muted)'}}>{v.sabor_produto}</small></td>
                <td>{v.quantidade} un</td>
                <td>R$ {fmt(v.preco_venda)}</td>
                <td style={{ fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(v.preco_venda * v.quantidade)}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(v.data).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
