// ─── Catálogo base ────────────────────────────────────────────────────────────
// Preços e puffs reais vêm da tabela `config` do Supabase.
// Sabores são dinâmicos — vêm da tabela `produtos`.
// Para um novo cliente: só altere este arquivo + o tema CSS.
export const CATALOGO_BASE = [
  { linha: 'v80_ignite', nome: 'V80 Ignite', desc: '8.000 puffs',  emoji: '💨', preco: 90.00 },
  { linha: 'elfbar',     nome: 'Elfbar',      desc: '10.000 puffs', emoji: '⚡', preco: 90.00 },
]

// ─── Usuários admin (simples, sem Supabase Auth) ─────────────────────────────
// Em produção futura: migrar para Supabase Auth.
export const USERS = {
  Admin: { senha: 'WaveP@d2026', role: 'admin', nome: 'Administrador' },
  Socio: { senha: 'Soci0@2026',  role: 'socio', nome: 'Sócio' },
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export const WA_DIEGO = import.meta.env.VITE_WA_DIEGO || '5511958438636'
export const WA_LUCAS = import.meta.env.VITE_WA_LUCAS || '5511978378289'
