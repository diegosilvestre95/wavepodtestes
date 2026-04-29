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
        quantidade: (p.quantidade || 0) + parseInt(form.quantidade), 
        custo: parseFloat(form.custo) 
      }).eq('id', p.id)
      setForm({ produtoId: '', quantidade: 1, custo: '', frete: 0 }); carregarDados()
    } catch (err) { alert(err.message) } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Supply Chain Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Inventory inbound processing and cost tracking.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Inbound Entry</h3>
          <form onSubmit={handleCompra}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Resource Node</label>
              <select className="input-field" value={form.produtoId} onChange={e => setForm({...form, produtoId: e.target.value})}>
                <option value="">— SELECT_RESOURCE —</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} {p.sabor}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Units</label><input type="number" className="input-field" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Cost Un.</label><input type="number" step="0.01" className="input-field" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} /></div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Freight Cost (R$)</label>
              <input type="number" step="0.01" className="input-field" value={form.frete} onChange={e => setForm({...form, frete: e.target.value})} />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: 12, background: '#111827', color: '#FFF' }} disabled={loading}>
              {loading ? 'PROCESSING...' : 'CONFIRM_INBOUND'}
            </button>
          </form>
        </div>

        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Historical Log</h3>
          <table className="data-table">
            <thead>
              <tr><th>Resource</th><th>Batch Size</th><th>Unit Cost</th><th>Freight</th><th>Exposure</th></tr>
            </thead>
            <tbody>
              {compras.slice(0, 15).map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{c.nome}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.sabor}</div>
                  </td>
                  <td>{c.quantidade} <small>UN</small></td>
                  <td>R$ {fmt(c.custo)}</td>
                  <td>R$ {fmt(c.frete)}</td>
                  <td style={{ fontWeight: 700 }}>R$ {fmt((c.custo * c.quantidade) + c.frete)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
