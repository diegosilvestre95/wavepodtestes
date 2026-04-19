# WavePod — React App

Sistema de vendas e gestão de pods descartáveis.

## Stack
- **React 18** + Vite
- **Supabase** (banco de dados + realtime)
- **React Router v6** (rotas)
- CSS puro com variáveis (sem Tailwind)

## Estrutura
```
src/
  lib/
    supabase.js      → cliente Supabase (singleton)
    config.js        → catálogo base, usuários, WhatsApp
    utils.js         → fmt, eKey, fmtDate
  context/
    AppContext.jsx   → estado global (produtos, carrinho, auth, toast)
  components/
    Header.jsx       → header sticky compartilhado
    Toast.jsx        → notificações toast
    Badge.jsx        → badge de status de estoque
  pages/
    Vitrine.jsx      → loja pública (/)
    Checkout.jsx     → finalização do pedido (/checkout)
    Login.jsx        → login admin (/login)
    Admin.jsx        → painel admin com sidebar (/admin)
    admin/
      Dashboard.jsx  → métricas financeiras
      Vendas.jsx     → registro de venda manual
      Compras.jsx    → registro de compra com sabores individuais
      Estoque.jsx    → tabela completa de estoque
      Precos.jsx     → edição de preços do catálogo
      Pedidos.jsx    → gerenciamento de pedidos de clientes
  themes/
    wavepod.css      → tema visual (troque para novo cliente)
```

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Edite o arquivo .env com suas credenciais do Supabase

# 3. Rodar em desenvolvimento
npm run dev
# Abre em http://localhost:5173

# 4. Build para produção
npm run build
```

## Deploy na Vercel

1. Suba o projeto para um repositório GitHub
2. Acesse vercel.com → "New Project" → importe o repositório
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WA_DIEGO`
   - `VITE_WA_LUCAS`
4. Clique em Deploy — pronto!

## Novo cliente

Para adaptar para outro cliente:
1. Crie `src/themes/cliente2.css` sobrescrevendo as variáveis `:root`
2. Atualize `src/lib/config.js` com o catálogo e dados do novo cliente
3. Crie um novo projeto Supabase e configure o `.env`
4. Faça deploy separado na Vercel com domínio próprio

## Rotas

| Rota        | Descrição                         | Acesso  |
|-------------|-----------------------------------|---------|
| `/`         | Vitrine pública (catálogo)        | Público |
| `/checkout` | Finalização do pedido             | Público |
| `/login`    | Login do administrador            | Público |
| `/admin`    | Painel de gestão                  | Admin   |

## Tabelas Supabase necessárias

- `produtos` — id, nome, sabor, quantidade, custo
- `pedidos` — id, numero_pedido, cliente_nome, cliente_sobrenome, cliente_whatsapp, itens (JSON), pagamento, total, status, created_at
- `vendas` — id, produto_id, quantidade, preco_venda, nome_produto, sabor_produto, data
- `historico` — id, tipo, descricao, valor, created_at
- `config` — id, chave, valor (para preços e descrições do catálogo)
