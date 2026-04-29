import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Compras() {
  const [produtos, setProdutos] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ produtoId: '', quantidade: 1, custo: '', frete: 0 })

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    const [p, c] = await Promise.all([
      sb.from('produtos').select('*').order('nome'),
      sb.from('compras').select('*').order('data', { ascending: false })
    ])
    setProdutos(p.data || [])
    setCompras(c.data || [])
  }

  const handleCompra = async (e) => {
    e.preventDefault()
    if (!form.produtoId || !form.custo) return
    setLoading(true)
    const p = produtos.find(i => i.id === parseInt(form.produtoId))
    try {
      await sb.from('compras').insert([{
        nome: p.nome, sabor: p.sabor, quantidade: parseInt(form.quantidade),
        custo: parseFloat(form.custo), frete: parseFloat(form.frete),
        data: new Date().toISOString()
      }])
      await sb.from('produtos').update({ 
        quantidade: p.quantidade + parseInt(form.quantidade), 
        custo: parseFloat(form.custo) 
      }).eq('id', p.id)
      setForm({ produtoId: '', quantidade: 1, custo: '', frete: 0 }); carregarDados()
    } catch (err) { alert(err.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginBottom: 24 }}>Entrada de Estoque</h3>
        <form onSubmit={handleCompra}>
          <div style={{ marginBottom: 16 }}>
            <label className="stat-label">Produto</label>
            <select className="input-field" value={form.produtoId} onChange={e => setForm({...form, produtoId: e.target.value})}>
              <option value="">— Selecione —</option>
              {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} {p.sabor}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><label className="stat-label">Qtd</label><input type="number" className="input-field" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} /></div>
            <div><label className="stat-label">Custo Un.</label><input type="number" step="0.01" className="input-field" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} /></div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="stat-label">Frete Total (R$)</label>
            <input type="number" step="0.01" className="input-field" value={form.frete} onChange={e => setForm({...form, frete: e.target.value})} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', background: '#3b82f6', color: '#fff' }} disabled={loading}>
            {loading ? 'REGISTRANDO...' : 'CONFIRMAR ENTRADA'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 24 }}>Aquisições</h3>
        <table className="table-container">
          <thead>
            <tr><th>Produto</th><th>Qtd</th><th>Unitário</th><th>Frete</th><th>Total</th></tr>
          </thead>
          <tbody>
            {compras.slice(0, 15).map(c => (
              <tr key={c.id}>
                <td><strong>{c.nome}</strong> <small style={{color:'var(--text-muted)'}}>{c.sabor}</small></td>
                <td>{c.quantidade} un</td>
                <td>R$ {fmt(c.custo)}</td>
                <td>R$ {fmt(c.frete)}</td>
                <td style={{ fontWeight: 800, color: '#3b82f6' }}>R$ {fmt((c.custo * c.quantidade) + c.frete)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
