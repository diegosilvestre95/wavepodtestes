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
    const { data: p } = await sb.from('produtos').select('*').order('nome')
    const { data: c } = await sb.from('compras').select('*').order('data', { ascending: false })
    setProdutos(p || [])
    setCompras(c || [])
  }

  const salvarCompra = async (e) => {
    e.preventDefault()
    if (!form.produtoId || !form.custo) return alert('Preencha os campos')

    setLoading(true)
    const p = produtos.find(i => i.id === parseInt(form.produtoId))
    const totalInvestido = (parseFloat(form.custo) * parseInt(form.quantidade)) + parseFloat(form.frete)

    try {
      // 1. Registrar Compra (Schema: nome, quantidade, custo, frete, sabor)
      const { error: cErr } = await sb.from('compras').insert([{
        nome: p.nome,
        sabor: p.sabor,
        quantidade: parseInt(form.quantidade),
        custo: parseFloat(form.custo),
        frete: parseFloat(form.frete),
        data: new Date().toISOString()
      }])
      if (cErr) throw cErr

      // 2. Atualizar Estoque e Custo Médio
      const { error: eErr } = await sb.from('produtos')
        .update({ 
          quantidade: p.quantidade + parseInt(form.quantidade),
          custo: parseFloat(form.custo) // Atualiza para o último custo
        })
        .eq('id', p.id)
      if (eErr) throw eErr

      alert('Compra registrada e estoque atualizado!')
      setForm({ produtoId: '', quantidade: 1, custo: '', frete: 0 })
      carregarDados()
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 32 }}>
        <h1>Registro de Compras</h1>
        <p className="subtext">Entrada de mercadorias e atualização automática de custos operacionais.</p>
      </div>

      <div className="ipad-grid" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        
        {/* FORMULÁRIO DE COMPRA */}
        <div className="ipad-card">
          <div className="label-caps" style={{ marginBottom: 20 }}>Nova Aquisição</div>
          
          <form onSubmit={salvarCompra}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Selecionar Produto</label>
              <select 
                value={form.produtoId}
                onChange={e => setForm({ ...form, produtoId: e.target.value })}
                required
              >
                <option value="">— Selecione para repor —</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} {p.sabor}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="form-group">
                <label>Qtd Comprada</label>
                <input 
                  type="number" 
                  value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Custo Unit. (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={form.custo}
                  onChange={e => setForm({ ...form, custo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Custo de Frete (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={form.frete}
                onChange={e => setForm({ ...form, frete: e.target.value })}
              />
            </div>

            <div style={{ padding: 16, background: '#050505', borderRadius: 8, marginBottom: 20, border: '1px solid var(--border-subtle)' }}>
               <div className="label-caps">Investimento Total</div>
               <div className="value-xl" style={{ color: '#3b82f6' }}>
                  R$ {fmt((parseFloat(form.custo || 0) * parseInt(form.quantidade || 1)) + parseFloat(form.frete || 0))}
               </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', background: '#3b82f6', color: '#fff' }} disabled={loading}>
              {loading ? 'REGISTRANDO...' : 'CONFIRMAR ENTRADA'}
            </button>
          </form>
        </div>

        {/* HISTÓRICO DE COMPRAS */}
        <div className="premium-table-wrap">
          <div style={{ padding: '16px 20px', background: '#050505', borderBottom: '1px solid var(--border-subtle)' }}>
             <div className="label-caps">Histórico de Aquisições</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Custo Un.</th>
                <th>Frete</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {compras.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.nome} <span style={{ color: '#94a3b8', fontSize: 11 }}>{c.sabor}</span></td>
                  <td style={{ fontWeight: 600 }}>{c.quantidade} un</td>
                  <td>R$ {fmt(c.custo)}</td>
                  <td style={{ color: '#475569' }}>R$ {fmt(c.frete)}</td>
                  <td style={{ fontWeight: 800, color: '#3b82f6' }}>R$ {fmt((c.custo * c.quantidade) + c.frete)}</td>
                  <td style={{ fontSize: 11, color: '#475569' }}>{new Date(c.data).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
