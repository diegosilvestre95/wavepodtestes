import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Precos() {
  const { catalogo, setCatalogo, toast } = useApp()
  const [valores, setValores] = useState({})
  const [saved, setSaved] = useState(false)

  const handleChange = (linha, v) => {
    setValores(prev => ({ ...prev, [linha]: v }))
  }

  const salvar = async () => {
    setSaved(false)
    for (const prod of catalogo) {
      const raw = valores[prod.linha]
      if (raw === undefined) continue
      const v = parseFloat(raw)
      if (isNaN(v) || v <= 0) { toast('Preço inválido para ' + prod.nome, '⚠️'); return }
      setCatalogo(prev => prev.map(c => c.linha === prod.linha ? { ...c, preco: v } : c))
      await sb.from('config').upsert({ chave: prod.linha, valor: v }, { onConflict: 'chave' })
    }
    setSaved(true)
    toast('Preços salvos e aplicados na vitrine!')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="container">
      <h2 className="section-title">Preços do Catálogo</h2>
      <div className="card" style={{ maxWidth: 700 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
          Altere o preço de venda exibido no catálogo. Ao salvar, aplica imediatamente na vitrine.
        </p>

        {catalogo.map(prod => (
          <div key={prod.linha} className="price-edit-card">
            <div style={{ flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 30 }}>{prod.emoji}</span>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, marginTop: 6 }}>{prod.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{prod.desc}</div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>
                Preço de venda (R$)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 18 }}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={prod.preco.toFixed(2)}
                  onChange={e => handleChange(prod.linha, e.target.value)}
                  style={{ width: 120, fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--green)', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="btn-row">
          <button className="btn-primary" onClick={salvar}>Salvar Preços ✓</button>
          {saved && <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ Salvo e aplicado!</span>}
        </div>
      </div>
    </div>
  )
}
