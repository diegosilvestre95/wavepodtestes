import { useApp } from '../../context/AppContext'
import { fmt } from '../../lib/utils'
import Badge from '../../components/Badge'

export default function Estoque() {
  const { produtosDB, carregarProdutos } = useApp()

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Estoque completo</h2>
        <button className="btn-ghost" onClick={carregarProdutos} style={{ fontSize: 12, padding: '7px 13px' }}>
          ↻ Atualizar
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Sabor</th>
                <th>Qtd</th>
                <th>Custo unit.</th>
                <th>Valor em estoque</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {produtosDB.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ color: 'var(--muted)' }}>{p.sabor || '—'}</td>
                  <td>{p.quantidade}</td>
                  <td>R$ {parseFloat(p.custo || 0).toFixed(2)}</td>
                  <td>R$ {fmt((p.quantidade || 0) * parseFloat(p.custo || 0))}</td>
                  <td><Badge tipo={p.quantidade} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {produtosDB.length === 0 && (
            <div className="empty"><span>📦</span>Nenhum produto cadastrado</div>
          )}
        </div>
      </div>
    </div>
  )
}
