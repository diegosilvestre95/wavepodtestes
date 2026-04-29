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
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFF' }}>Direct <span style={{ color: 'var(--wp-yellow)' }}>Terminal</span></h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Real-time inventory outflow management.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, alignItems: 'start' }}>
        
        {/* 💰 INPUT NODE */}
        <div className="premium-card gold-edge">
          <div className="stat-title" style={{ marginBottom: 32 }}>Transaction Entry</div>
          <form onSubmit={handleVenda}>
            <div style={{ marginBottom: 20 }}>
              <label className="stat-title" style={{ fontSize: 10 }}>Search Catalog</label>
              <input className="input-premium" placeholder="Model or flavor name..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="stat-title" style={{ fontSize: 10 }}>Select Resource</label>
              <select className="input-premium" value={form.produtoId} onChange={e => {
                const p = produtos.find(i => i.id === parseInt(e.target.value))
                setForm({...form, produtoId: e.target.value, preco_venda: p?.preco_venda || ''})
              }}>
                <option value="">— SELECT_NODE —</option>
                {prodFiltrados.map(p => (
                  <option key={p.id} value={p.id} style={{background:'#18181b'}}>{p.nome} {p.sabor} ({p.quantidade} un)</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 32 }}>
              <div>
                <label className="stat-title" style={{ fontSize: 10 }}>Units</label>
                <input type="number" className="input-premium" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
              </div>
              <div>
                <label className="stat-title" style={{ fontSize: 10 }}>Unit Value (R$)</label>
                <input type="number" step="0.01" className="input-premium" value={form.preco_venda} onChange={e => setForm({...form, preco_venda: e.target.value})} />
              </div>
            </div>
            <button className="btn-ultimate" style={{ width: '100%', height: 56 }} disabled={loading}>
              {loading ? 'SYNCING...' : 'EXECUTE_SALE_NODE'}
            </button>
          </form>
        </div>

        {/* 📊 HISTORY NODE */}
        <div className="premium-card">
          <div className="stat-title" style={{ marginBottom: 32 }}>Recent Outflows</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="wp-surface">
              <thead>
                <tr><th>Resource</th><th>Units</th><th>Yield</th></tr>
              </thead>
              <tbody>
                {vendas.slice(0, 10).map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{v.nome_produto}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dark)' }}>{v.sabor_produto}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.quantidade} <span style={{fontSize:10, color:'var(--text-dark)'}}>UN</span></td>
                    <td style={{ fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(v.preco_venda * v.quantidade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
