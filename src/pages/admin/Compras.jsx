import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Compras() {
  const [produtos, setProdutos] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Estado do formulário agora focado em strings para permitir novos cadastros
  const [form, setForm] = useState({ 
    nome: '', 
    sabor: '', 
    quantidade: 1, 
    custo: '', 
    frete: 0 
  })

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
    if (!form.nome || !form.custo) return
    setLoading(true)

    try {
      // 1. Verificar se o produto (Nome + Sabor) já existe
      const { data: existente } = await sb.from('produtos')
        .select('*')
        .eq('nome', form.nome)
        .eq('sabor', form.sabor)
        .single()

      if (existente) {
        // ATUALIZA EXISTENTE
        await sb.from('produtos').update({ 
          quantidade: (existente.quantidade || 0) + parseInt(form.quantidade), 
          custo: parseFloat(form.custo) 
        }).eq('id', existente.id)
      } else {
        // CRIA NOVO PRODUTO
        await sb.from('produtos').insert([{
          nome: form.nome,
          sabor: form.sabor,
          quantidade: parseInt(form.quantidade),
          custo: parseFloat(form.custo),
          preco_venda: parseFloat(form.custo) * 1.5, // Margem padrão inicial
          linha: form.nome.toLowerCase().replace(/\s+/g, '_')
        }])
      }

      // 2. Registrar a Compra no Log
      await sb.from('compras').insert([{
        nome: form.nome, 
        sabor: form.sabor, 
        quantidade: parseInt(form.quantidade),
        custo: parseFloat(form.custo), 
        frete: parseFloat(form.frete),
        data: new Date().toISOString()
      }])

      setForm({ nome: '', sabor: '', quantidade: 1, custo: '', frete: 0 })
      carregarDados()
      alert('Entrada de estoque processada com sucesso!')
    } catch (err) { 
      alert('Erro ao processar: ' + err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  // Lista de nomes únicos para sugestão
  const sugestoesNomes = [...new Set(produtos.map(p => p.nome))]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Gestão de Suprimentos</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Entrada de novos modelos ou reposição de estoque existente.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* 📥 SMART INBOUND CONSOLE */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Entrada de Lote</h3>
          <form onSubmit={handleCompra}>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Recurso / Modelo</label>
              <input 
                className="input-field" 
                list="nomes-produtos"
                placeholder="Ex: Ignite V80, Oxbar..."
                value={form.nome} 
                onChange={e => setForm({...form, nome: e.target.value})} 
                required
              />
              <datalist id="nomes-produtos">
                {sugestoesNomes.map(n => <option key={n} value={n} />)}
              </datalist>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Sabor / Especificação</label>
              <input 
                className="input-field" 
                placeholder="Ex: Watermelon Ice, Grape..."
                value={form.sabor} 
                onChange={e => setForm({...form, sabor: e.target.value})} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Qtd</label>
                <input type="number" className="input-field" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Custo Un.</label>
                <input type="number" step="0.01" className="input-field" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} required />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Valor do Frete do Lote (R$)</label>
              <input type="number" step="0.01" className="input-field" value={form.frete} onChange={e => setForm({...form, frete: e.target.value})} />
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: 14, background: '#111827', color: '#FFF' }} disabled={loading}>
              {loading ? 'PROCESSANDO...' : 'CONFIRMAR ENTRADA'}
            </button>
          </form>
        </div>

        {/* 📊 HISTORICAL LOG */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Log de Aquisições Recentes</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto / Sabor</th>
                <th>Lote</th>
                <th>Custo Un.</th>
                <th>Investimento</th>
                <th>Data</th>
              </tr>
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
                  <td style={{ fontWeight: 700 }}>R$ {fmt((c.custo * c.quantidade) + c.frete)}</td>
                  <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(c.data).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
