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
    const { data: p } = await sb.from('produtos').select('*').order('nome')
    const { data: v } = await sb.from('vendas').select('*').order('data', { ascending: false })
    setProdutos(p || [])
    setVendas(v || [])
  }

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (p.sabor || '').toLowerCase().includes(busca.toLowerCase())
  )

  const registrarVenda = async (e) => {
    e.preventDefault()
    if (!form.produtoId || !form.preco_venda) return alert('Preencha todos os campos')
    
    setLoading(true)
    const p = produtos.find(item => item.id === parseInt(form.produtoId))
    
    try {
      // 1. Registrar Venda (Sincronizado com Schema: nome_produto, sabor_produto)
      const { error: vErr } = await sb.from('vendas').insert([{
        produto_id: p.id,
        nome_produto: p.nome,
        sabor_produto: p.sabor,
        quantidade: parseInt(form.quantidade),
        preco_venda: parseFloat(form.preco_venda),
        data: new Date().toISOString()
      }])

      if (vErr) throw vErr

      // 2. Baixar Estoque
      const { error: eErr } = await sb.from('produtos')
        .update({ quantidade: p.quantidade - parseInt(form.quantidade) })
        .eq('id', p.id)

      if (eErr) throw eErr

      alert('Venda realizada com sucesso!')
      setForm({ produtoId: '', quantidade: 1, preco_venda: '' })
      setBusca('')
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
        <h1>Vendas Manuais</h1>
        <p className="subtext">Registre vendas diretas e baixe o estoque instantaneamente.</p>
      </div>

      <div className="ipad-grid" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        
        {/* FORMULÁRIO DE VENDA */}
        <div className="ipad-card">
          <div className="label-caps" style={{ marginBottom: 20 }}>Nova Operação</div>
          
          <form onSubmit={registrarVenda}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Buscar Produto</label>
              <input 
                type="text" 
                placeholder="Digite o nome ou sabor..." 
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Selecionar Item</label>
              <select 
                value={form.produtoId}
                onChange={e => {
                  const val = e.target.value
                  const p = produtos.find(i => i.id === parseInt(val))
                  setForm({ ...form, produtoId: val, preco_venda: p?.preco_venda || '' })
                }}
                required
              >
                <option value="">— Clique para selecionar —</option>
                {produtosFiltrados.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.sabor} (Estoque: {p.quantidade})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="form-group">
                <label>Qtd</label>
                <input 
                  type="number" 
                  value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: e.target.value })}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={form.preco_venda}
                  onChange={e => setForm({ ...form, preco_venda: e.target.value })}
                />
              </div>
            </div>

            <div style={{ padding: 16, background: '#050505', borderRadius: 8, marginBottom: 20, border: '1px solid var(--border-subtle)' }}>
               <div className="label-caps">Total da Venda</div>
               <div className="value-xl" style={{ color: 'var(--wp-yellow)' }}>
                  R$ {fmt((parseFloat(form.preco_venda || 0) * parseInt(form.quantidade || 1)))}
               </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'PROCESSANDO...' : 'FINALIZAR VENDA'}
            </button>
          </form>
        </div>

        {/* HISTÓRICO DE VENDAS */}
        <div className="premium-table-wrap">
          <div style={{ padding: '16px 20px', background: '#050505', borderBottom: '1px solid var(--border-subtle)' }}>
             <div className="label-caps">Histórico de Movimentação</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produto / Modelo</th>
                <th>Sabor</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700 }}>{v.nome_produto}</td>
                  <td style={{ color: '#94a3b8' }}>{v.sabor_produto}</td>
                  <td style={{ fontWeight: 600 }}>{v.quantidade} un</td>
                  <td style={{ fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {fmt(v.preco_venda)}</td>
                  <td style={{ fontSize: 11, color: '#475569' }}>{new Date(v.data).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
