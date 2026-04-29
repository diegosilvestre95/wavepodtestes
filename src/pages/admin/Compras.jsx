import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Compras() {
  const { toast } = useApp()
  const [modelos, setModelos] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados do formulário
  const [sel, setSel] = useState('')
  const [qtd, setQtd] = useState(0)
  const [custo, setCusto] = useState('')
  const [sabores, setSabores] = useState([]) // Array dinâmico de sabores

  const carregar = async () => {
    setLoading(true)
    const { data } = await sb.from('produtos').select('nome').order('nome')
    const unique = [...new Set(data?.map(i => i.nome))]
    setModelos(unique)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  // Efeito para gerar os campos de sabores dinamicamente quando a quantidade muda
  useEffect(() => {
    const q = parseInt(qtd) || 0
    setSabores(Array(q).fill(''))
  }, [qtd])

  const handleSaborChange = (index, value) => {
    const newSabores = [...sabores]
    newSabores[index] = value
    setSabores(newSabores)
  }

  const registrarCompra = async () => {
    if (!sel || !qtd || !custo || sabores.some(s => !s)) {
      return toast('Preencha o modelo, custo e todos os sabores!', '⚠️')
    }
    
    try {
      for (const s of sabores) {
        // Lógica Relacional: Verifica se esse sabor já existe para esse modelo
        const { data: p } = await sb.from('produtos').select('*').eq('nome', sel).eq('sabor', s).single()

        if (p) {
          await sb.from('produtos').update({ 
            quantidade: p.quantidade + 1,
            custo_unitario: parseFloat(custo)
          }).eq('id', p.id)
        } else {
          await sb.from('produtos').insert({
            nome: sel,
            sabor: s,
            quantidade: 1,
            custo_unitario: custo,
            preco_venda: 90 // Preço inicial padrão
          })
        }
      }

      // Registra a transação na tabela de Compras
      await sb.from('compras').insert({
        produto_nome: sel,
        quantidade: qtd,
        investimento_total: qtd * custo
      })

      toast('Compra e sabores registrados com sucesso!', '📥')
      setSel(''); setQtd(0); setCusto(''); setSabores([]);
    } catch (e) {
      toast('Erro ao processar entrada', '❌')
    }
  }

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Lendo banco de dados...</div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Compras</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Registre o investimento e as variações de sabor da nova remessa.</p>
      </div>

      <div className="ipad-card" style={{ maxWidth: 700, background: '#121212' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div className="form-group">
            <label>Modelo do Produto</label>
            <select value={sel} onChange={e => setSel(e.target.value)} style={{ background: '#09090b' }}>
              <option value="">— Selecione —</option>
              {modelos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Custo Unit. (R$)</label>
            <input type="number" value={custo} onChange={e => setCusto(e.target.value)} style={{ background: '#09090b' }} />
          </div>
        </div>

        <div className="form-group">
          <label>Quantidade de Unidades (Gera campos de sabor)</label>
          <input 
            type="number" 
            min="0"
            value={qtd} 
            onChange={e => setQtd(e.target.value)} 
            style={{ background: '#09090b', border: '1px solid var(--wp-yellow)' }} 
          />
        </div>

        {/* CAMPOS DINÂMICOS DE SABORES */}
        {sabores.length > 0 && (
          <div style={{ 
            marginTop: 30, padding: 25, background: '#09090b', borderRadius: 20, 
            border: '1px solid #1e1e22', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 
          }}>
            <div style={{ gridColumn: '1 / -1', fontSize: 11, fontWeight: 800, color: '#52525b', marginBottom: 5 }}>
              DEFINA OS SABORES DAS {qtd} UNIDADES:
            </div>
            {sabores.map((s, i) => (
              <input 
                key={i}
                type="text"
                placeholder={`Sabor do item ${i + 1}`}
                value={s}
                onChange={e => handleSaborChange(i, e.target.value)}
                style={{ height: 48, fontSize: 13 }}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: 30, padding: '24px', background: '#09090b', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e1e22' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b' }}>INVESTIMENTO TOTAL</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--wp-yellow)' }}>R$ {qtd * custo}</div>
          </div>
          <button className="btn-primary" onClick={registrarCompra}>FINALIZAR COMPRA ✓</button>
        </div>
      </div>
    </div>
  )
}
