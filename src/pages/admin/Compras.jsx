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
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFF' }}>Inbound <span style={{ color: 'var(--wp-yellow)' }}>Logistics</span></h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Inventory acquisition and cost exposure nodes.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, alignItems: 'start' }}>
        
        {/* 📥 INBOUND NODE */}
        <div className="premium-card gold-edge">
          <div className="stat-title" style={{ marginBottom: 32 }}>Acquisition Entry</div>
          <form onSubmit={handleCompra}>
            <div style={{ marginBottom: 20 }}>
              <label className="stat-title" style={{ fontSize: 10 }}>Resource Model</label>
              <select className="input-premium" value={form.produtoId} onChange={e => setForm({...form, produtoId: e.target.value})}>
                <option value="">— SELECT_RESOURCE —</option>
                {produtos.map(p => <option key={p.id} value={p.id} style={{background:'#18181b'}}>{p.nome} {p.sabor}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="stat-title" style={{ fontSize: 10 }}>Volume</label>
                <input type="number" className="input-premium" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
              </div>
              <div>
                <label className="stat-title" style={{ fontSize: 10 }}>Unit Cost (R$)</label>
                <input type="number" step="0.01" className="input-premium" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} />
              </div>
            </div>
            <div style={{ marginBottom: 32 }}>
              <label className="stat-title" style={{ fontSize: 10 }}>Freight Exposure (R$)</label>
              <input type="number" step="0.01" className="input-premium" value={form.frete} onChange={e => setForm({...form, frete: e.target.value})} />
            </div>
            <button className="btn-ultimate" style={{ width: '100%', height: 56, background: '#FFF', color: '#000' }} disabled={loading}>
              {loading ? 'PROCESSING...' : 'CONFIRM_ACQUISITION'}
            </button>
          </form>
        </div>

        {/* 📊 LOG NODE */}
        <div className="premium-card">
          <div className="stat-title" style={{ marginBottom: 32 }}>Recent Inbound Batches</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="wp-surface">
              <thead>
                <tr><th>Resource</th><th>Batch</th><th>Exposure</th></tr>
              </thead>
              <tbody>
                {compras.slice(0, 10).map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dark)' }}>{c.sabor}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.quantidade} <span style={{fontSize:10, color:'var(--text-dark)'}}>UN</span></td>
                    <td style={{ fontWeight: 800 }}>R$ {fmt((c.custo * c.quantidade) + c.frete)}</td>
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
