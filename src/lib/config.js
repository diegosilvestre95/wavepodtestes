// ─── Catálogo base ────────────────────────────────────────────────────────────
export const CATALOGO_BASE = [
  { linha: 'v80_ignite', nome: 'V80 Ignite', desc: '8.000 puffs',  emoji: '💨', preco: 90.00 },
  { linha: 'elfbar',     nome: 'Elfbar',      desc: '10.000 puffs', emoji: '⚡', preco: 90.00 },
]

// ─── Usuário Único (E-mail e Senha) ──────────────────────────────────────────
export const USERS = {
  "diegoasilvestre@live.com": { 
    senha: '181195Di@', 
    role: 'admin', 
    nome: 'Diego Silvestre' 
  }
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export const WA_DIEGO = import.meta.env.VITE_WA_DIEGO || '5511958438636'
export const WA_LUCAS = import.meta.env.VITE_WA_LUCAS || '5511978378289'
