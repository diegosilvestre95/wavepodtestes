// Formata número para moeda brasileira: 1234.5 → "1.234,50"
export const fmt = (n) =>
  parseFloat(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Chave composta nome+sabor para o mapa de estoque
export const eKey = (nome, sabor) => (sabor ? `${nome}___${sabor}` : nome)

// Formata ISO date para pt-BR
export const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'
