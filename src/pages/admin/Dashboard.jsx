import { useState, useEffect, useMemo } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'

export default function Dashboard() {
  const [data, setData] = useState({ vendas: [], compras: [], pedidos: [], produtos: [] })
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    try {
      const [v, c, p, pr] = await Promise.all([
        sb.from('vendas').select('*').order('data', { ascending: false }),
        sb.from('compras').select('*'),
        sb.from('pedidos').select('*').order('created_at', { ascending: false }),
        sb.from('produtos').select('*')
      ])
      setData({ 
        vendas: v.data || [], 
        compras: c.data || [], 
        pedidos: p.data || [],
        produtos: pr.data || []
      })
    } catch (err) {
      console.error("Falha ao carregar dashboard:", err)
    }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const stats = useMemo(() => {
    const investido = data.compras.reduce((a, b) => a + (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0)) + parseFloat(b.frete || 0), 0)
    const fatVendas = data.vendas.reduce((a, b) => a + (parseFloat(b.preco_venda || 0) * parseInt(b.quantidade || 0)), 0)
    const fatPedidos = data.pedidos.filter(p => p.status === 'Confirmado').reduce((a, b) => a + parseFloat(b.total || 0), 0)
    const faturamento = fatVendas + fatPedidos
    const lucro = faturamento - investido
    return { investido, faturamento, lucro }
  }, [data])

  const inventario = useMemo(() => {
    const totalUnid = data.produtos.reduce((a, b) => a + (b.quantidade || 0), 0)
    const valEstoque = data.produtos.reduce((a, b) => a + (parseFloat(b.custo || 0) * parseInt(b.quantidade || 0)), 0)
    return { totalUnid, valEstoque }
  }, [data])

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>SINCRONIZANDO DADOS...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Visão Analítica</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Métricas operacionais e financeiras em tempo real.</p>
      </div>

      {/* 📊 KPI ROW */}
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-title">Capital Investido</div>
          <div className="kpi-value">R$ {fmt(stats.investido)}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>Compras + Fretes</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Faturamento Bruto</div>
          <div className="kpi-value">R$ {fmt(stats.faturamento)}</div>
          <div className="kpi-trend" style={{ color: '#16a34a' }}>Vendas + Pedidos Conf.</div>
        </div>
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--wp-yellow)' }}>
          <div className="kpi-title">Lucro Líquido</div>
          <div className="kpi-value" style={{ color: 'var(--wp-yellow-dark)' }}>R$ {fmt(stats.lucro)}</div>
          <div className="kpi-trend" style={{ color: '#16a34a' }}>Margem Operacional</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Avaliação de Estoque</div>
          <div className="kpi-value">R$ {fmt(inventario.valEstoque)}</div>
          <div className="kpi-trend">{inventario.totalUnid} unidades ativas</div>
        </div>
      </div>

      {/* 🧱 DATA BLOCKS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24 }}>
        
        {/* LOG DE OPERAÇÕES */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Log de Operações</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Produto</th><th>Qtd</th><th>Total</th></tr>
            </thead>
            <tbody>
              {data.vendas.slice(0, 8).map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{v.nome_produto}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{v.sabor_produto}</div>
                  </td>
                  <td style={{ fontSize: 11 }}>{v.quantidade} <small>UN</small></td>
                  <td style={{ fontWeight: 700, fontSize: 11 }}>R$ {fmt(v.preco_venda * v.quantidade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FILA DE PEDIDOS */}
        <div style={{ background: '#FFF', padding: 24, border: '1px solid var(--border)', borderRadius: 6 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>Fila de Pedidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.pedidos.slice(0, 6).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{p.cliente_nome}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>#{String(p.id).slice(-4)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 11 }}>R$ {fmt(p.total)}</div>
                  <div style={{ fontSize: 8, color: p.status === 'Confirmado' ? '#166534' : '#6B7280', fontWeight: 800 }}>{p.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RENDIMENTO SÓCIOS */}
        <div style={{ background: '#111827', padding: 24, border: '1px solid var(--border)', borderRadius: 6, color: '#FFF' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--wp-yellow)', marginBottom: 20 }}>Divisão de Lucros</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--wp-yellow)', opacity: 0.8 }}>RENDIMENTO DIEGO</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>R$ {fmt(stats.lucro / 2)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>Participação 50.0%</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--wp-yellow)', opacity: 0.8 }}>RENDIMENTO LUCAS</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>R$ {fmt(stats.lucro / 2)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>Participação 50.0%</div>
             </div>
             <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 10, color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                Sincronizado com Fluxo de Caixa
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
