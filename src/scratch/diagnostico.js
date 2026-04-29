import { sb } from '../lib/supabase'

export async function rodarDiagnostico() {
  console.log('🚀 Iniciando Pente Fino Técnico...')
  
  const tabelas = ['produtos', 'vendas', 'compras', 'pedidos']
  const schema = {}

  for (const t of tabelas) {
    const { data } = await sb.from(t).select('*').limit(1)
    if (data && data[0]) {
      schema[t] = Object.keys(data[0])
    } else {
      schema[t] = 'TABELA VAZIA OU SEM ACESSO'
    }
  }

  console.log('📊 Estrutura Real do Banco de Dados:', schema)
  return schema
}
