import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import { fmt, fmtDate } from '../../lib/utils'
import { WA_DIEGO, WA_LUCAS } from '../../lib/config'

const STATUS_CLS = { Confirmado: 'status-conf', Cancelado: 'status-canc', Pendente: 'status-pend' }

export default function Pedidos() {
  const { carregarProdutos, toast } = useApp()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    const { data } = await sb.from('pedidos').select('*').order('created_at', { ascending: false })
    setPedidos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    const onUpdate = () => carregar()
    window.addEventListener('wvpod:pedidoatualizado', onUpdate)
    window.addEventListener('wvpod:novopedido', onUpdate)
    return () => {
      window.removeEventListener('wvpod:pedidoatualizado', onUpdate)
      window.removeEventListener('wvpod:novopedido', onUpdate)
    }
  }, [])

  const updateStatus = async (pedido, novoStatus) => {
    const statusAnterior = pedido.status
    await sb.from('pedidos').update({ status: novoStatus }).eq('id', pedido.id)

    const itens = JSON.parse(pedido.itens || '[]')
    const nomeCliente = `${pedido.cliente_nome || ''} ${pedido.cliente_sobrenome || ''}`.trim()

    // Confirmar → decrementa estoque + registra receita
    if (novoStatus === 'Confirmado' && statusAnterior !== 'Confirmado') {
      const { data: prodsAtuais } = await sb.from('produtos').select('*')
      for (const item of itens) {
        let restante = item.qty
        const candidatos = (prodsAtuais || []).filter(
          p => p.nome === item.nome && (p.sabor || '') === item.sabor && p.quantidade > 0
        )
        for (const prod of candidatos) {
          if (restante <= 0) break
          const dec = Math.min(prod.quantidade, restante)
          await sb.from('produtos').update({ quantidade: prod.quantidade - dec }).eq('id', prod.id)
          restante -= dec
        }
      }
      await sb.from('historico').insert({
        tipo: 'Pedido',
        descricao: `${pedido.numero_pedido} · ${nomeCliente} · ${pedido.pagamento}`,
        valor: pedido.total,
      })
      await carregarProdutos()
      toast('✅ Pedido confirmado! Estoque e dashboard atualizados.')
    }

    // Cancelar um já confirmado → reverte estoque + remove histórico
    if (novoStatus === 'Cancelado' && statusAnterior === 'Confirmado') {
      const { data: prodsAtuais } = await sb.from('produtos').select('*')
      for (const item of itens) {
        const prod = (prodsAtuais || []).find(p => p.nome === item.nome && (p.sabor || '') === item.sabor)
        if (prod) {
          await sb.from('produtos').update({ quantidade: prod.quantidade + item.qty }).eq('id', prod.id)
        }
      }
      await sb.from('historico')
        .delete()
        .eq('descricao', `${pedido.numero_pedido} · ${nomeCliente} · ${pedido.pagamento}`)
        .eq('tipo', 'Pedido')
      await carregarProdutos()
      toast('🔄 Pedido cancelado. Estoque revertido.', '⚠️')
    }

    await carregar()
  }

  const waLink = (wa) => {
    const raw = (wa || '').replace(/\D/g, '')
    return raw.startsWith('55') && raw.length >= 12 ? raw : '55' + raw
  }

  const msgWA = (p) => {
    const itens = JSON.parse(p.itens || '[]')
    return encodeURIComponent(
      `🌊 Pedido ${p.numero_pedido}\nCliente: ${p.cliente_nome} ${p.cliente_sobrenome || ''} (${p.cliente_whatsapp})\n` +
      itens.map(i => `• ${i.nome}${i.sabor ? ' · ' + i.sabor : ''} x${i.qty}`).join('\n') +
      `\nTotal: R$ ${fmt(p.total)} (${p.pagamento})`
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Pedidos de clientes</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`https://wa.me/${WA_DIEGO}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            💬 Diego
          </a>
          <a href={`https://wa.me/${WA_LUCAS}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#128C7E', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            💬 Lucas
          </a>
        </div>
      </div>

      <div className="card">
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.18)', borderRadius: 'var(--radius-sm)' }}>
          ⚠️ <strong style={{ color: 'var(--amber)' }}>Regra de estoque:</strong> o estoque e o dashboard <strong style={{ color: 'var(--text)' }}>só são alterados quando você confirmar</strong> o pedido. Pedidos Pendentes não afetam nada. Ao cancelar um pedido já confirmado, o estoque é revertido automaticamente.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nº Pedido</th><th>Cliente</th><th>WhatsApp</th>
                <th>Itens</th><th>Total</th><th>Pagamento</th>
                <th>Status</th><th>Data</th><th>Contato</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => {
                const itens = JSON.parse(p.itens || '[]')
                const itensTexto = itens.map(i => `${i.nome}${i.sabor ? ' · ' + i.sabor : ''} ×${i.qty}`).join(', ')
                const waNum = waLink(p.cliente_whatsapp)
                return (
                  <tr key={p.id}>
                    <td><strong style={{ fontFamily: 'Outfit, sans-serif' }}>{p.numero_pedido}</strong></td>
                    <td>{p.cliente_nome} {p.cliente_sobrenome || ''}</td>
                    <td>
                      {p.cliente_whatsapp
                        ? <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer"
                            style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                            📲 {p.cliente_whatsapp}
                          </a>
                        : '—'}
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 160, lineHeight: 1.5 }}>{itensTexto}</td>
                    <td><strong style={{ color: 'var(--green)' }}>R$ {fmt(p.total)}</strong></td>
                    <td>{p.pagamento}</td>
                    <td>
                      <select
                        className={`status-select ${STATUS_CLS[p.status] || ''}`}
                        value={p.status}
                        onChange={e => updateStatus(p, e.target.value)}
                      >
                        <option>Pendente</option>
                        <option>Confirmado</option>
                        <option>Cancelado</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(p.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <a href={`https://wa.me/${WA_DIEGO}?text=${msgWA(p)}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, background: 'rgba(37,211,102,.12)', color: '#4ade80', border: '1px solid rgba(37,211,102,.2)', borderRadius: 6, padding: '3px 8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          📲 Diego
                        </a>
                        <a href={`https://wa.me/${WA_LUCAS}?text=${msgWA(p)}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, background: 'rgba(37,211,102,.12)', color: '#4ade80', border: '1px solid rgba(37,211,102,.2)', borderRadius: 6, padding: '3px 8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          📲 Lucas
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pedidos.length === 0 && !loading && (
            <div className="empty"><span>📋</span>Nenhum pedido ainda</div>
          )}
        </div>
      </div>
    </div>
  )
}
