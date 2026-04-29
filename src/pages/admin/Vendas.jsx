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
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Operation Terminal</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manual sales node processing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* 💰 INPUT CONSOLE */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Transaction Entry</h3>
          <form onSubmit={handleVenda}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Search Catalog</label>
              <input className="input-field" placeholder="Type model or flavor..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Select Resource</label>
              <select className="input-field" value={form.produtoId} onChange={e => {
                const p = produtos.find(i => i.id === parseInt(e.target.value))
                setForm({...form, produtoId: e.target.value, preco_venda: p?.preco_venda || ''})
              }}>
                <option value="">— SELECT_NODE —</option>
                {prodFiltrados.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} {p.sabor} ({p.quantidade} un)</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Qty</label>
                <input type="number" className="input-field" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Price (R$)</label>
                <input type="number" step="0.01" className="input-field" value={form.preco_venda} onChange={e => setForm({...form, preco_venda: e.target.value})} />
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
              {loading ? 'EXECUTING...' : 'COMMIT_TRANSACTION'}
            </button>
          </form>
        </div>

        {/* 📊 HISTORY LOG */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Terminal History</h3>
          <table className="data-table">
            <thead>
              <tr><th>Resource</th><th>Units</th><th>Total</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {vendas.slice(0, 15).map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.nome_produto}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.sabor_produto}</div>
                  </td>
                  <td>{v.quantidade} <small>UN</small></td>
                  <td style={{ fontWeight: 700 }}>R$ {fmt(v.preco_venda * v.quantidade)}</td>
                  <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(v.data).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
