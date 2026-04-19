export default function Badge({ tipo }) {
  if (tipo === 0)    return <span className="badge badge-red">Esgotado</span>
  if (tipo <= 2)     return <span className="badge badge-amber">Baixo</span>
  return               <span className="badge badge-green">OK</span>
}
