import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Compras() {
  const { toast } = useApp()
  const [modelos, setModelos] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState('')
  const [qtd, setQtd] = useState(1)
  const [custo, setCusto] = useState('')
  const [sabor, setSabor] = useState('')

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('nome').order('nome')
    const unique = [...new Set(data?.map(i => i.nome))]
    setModelos(unique)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const registrar = async () => {
    if (!sel || !qtd || !custo || !sabor) return toast('Preencha todos os campos', '⚠️')
    
    // Tenta encontrar o produto exato (nome + sabor)
    const { data: p } = await sb.from('produtos').select('*').eq('nome', sel).eq('sabor', sabor).single()

    if (p) {
      // Atualiza existente
      await sb.from('produtos').update({ 
        quantidade: p.quantidade + parseInt(qtd),
        custo_unitario: parseFloat(custo)
      }).eq('id', p.id)
    } else {
      // Cria novo (Relação automática)
      await sb.from('produtos').insert({
        nome: sel,
        sabor,
        quantidade: qtd,
        custo_unitario: custo,
        preco_venda: 90 // Preço padrão inicial
      })
    }

    await sb.from('compras').insert({
      produto_nome: sel,
      quantidade: qtd,
      investimento_total: qtd * custo
    })

    toast('Compra e estoque registrados!', '📥')
    setSel(''); setQtd(1); setCusto(''); setSabor('');
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Lendo modelos ativos...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Entrada de Estoque</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Registre novas compras e atualize o inventário automaticamente.</p>
      </div>

      <div className="ipad-card" style={{ maxWidth: 600, background: '#121212' }}>
        <div className="form-group">
          <label>Modelo do Pod</label>
          <select value={sel} onChange={e => setSel(e.target.value)} style={{ background: '#09090b' }}>
            <option value="">— Selecione o Modelo —</option>
            {modelos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Sabor / Variável</label>
          <input 
            type="text" 
            placeholder="Ex: Watermelon Ice" 
            value={sabor} 
            onChange={e => setSabor(e.target.value)}
            style={{ background: '#09090b' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="form-group">
            <label>Qtd. Comprada</label>
            <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} style={{ background: '#09090b' }} />
          </div>
          <div className="form-group">
            <label>Custo Unitário (R$)</label>
            <input type="number" value={custo} onChange={e => setCusto(e.target.value)} style={{ background: '#09090b' }} />
          </div>
        </div>

        <div style={{ marginTop: 20, padding: '24px', background: '#09090b', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e1e22' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b' }}>INVESTIMENTO TOTAL</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {qtd * custo}</div>
          </div>
          <button className="btn-primary" onClick={registrar} style={{ padding: '12px 24px' }}>REGISTRAR ENTRADA ✓</button>
        </div>
      </div>
    </div>
  )
}
