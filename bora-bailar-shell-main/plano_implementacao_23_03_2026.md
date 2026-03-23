# Plano de Implementação — Conectar Mobile Direto ao Flask Admin [23/03/2026]

## Contexto & Diagnóstico

**Problema:** O app mobile não está puxando conteúdos do admin.
**Causa raiz:** O mobile aponta ao Express shell (porta 5001) que faz proxy para o Flask admin (porta 5000). O Express shell NÃO está rodando e depende de PostgreSQL, que foi removido (migrado para SQLite). O Flask admin ESTÁ rodando e respondendo com conteúdo real (4 stories, 3 featured, 14 recomendações, 6 quero cards, 1 weekly tip, 3 awards).
**Solução:** Apontar o mobile diretamente ao Flask admin (porta 5000), eliminando a dependência do Express shell e do PostgreSQL.

**Último commit:** `98679ff` — feat: calendário inline iOS, destaque dinâmico [21/03/2026]
**Commits hoje:** Nenhum

**Cadeia de dados ATUAL (quebrada):**
```
📱 Mobile → Express:5001 ❌ (não rodando) → Flask:5000 ✅ (com conteúdo)
```

**Cadeia de dados PROPOSTA:**
```
📱 Mobile → Flask:5000 ✅ (direto, sem intermediário)
```

## Compatibilidade de Rotas (Flask vs Express)

| Rota | Flask | Express | Impacto |
|------|-------|---------|---------|
| `GET /api/discover` | ✅ | proxy | Rota principal da home — funciona direto |
| `GET /api/weekly-tips` | ✅ | proxy | Dicas da semana — funciona direto |
| `GET /api/places` | ✅ | proxy | Parceiros — funciona direto |
| `POST /api/auth/login` | ✅ | proxy | Login — funciona direto |
| `POST /api/auth/register` | ✅ | proxy | Cadastro — funciona direto |
| `GET /api/auth/me` | ✅ | proxy | Sessão — funciona direto |
| `GET /api/content/home` | ❌ | local | Sem impacto — fallback retorna `{}` |
| `GET /api/content/partner-brands` | ❌ | local | Sem impacto — fallback retorna `[]` |
| `POST /api/push-tokens/register` | ❌ | local | Sem impacto — já falhava antes |

**Bônus:** Corrige bug de double-unwrap do `{ success, data }` (Express extraía `.data` e `realApi.ts` tentava extrair de novo).

## Checklist de Implementação

- [x] **Análise**: Diagnosticar causa raiz do app não puxar conteúdo do admin [23/03/2026]
- [x] **Análise**: Mapear todas as rotas que o mobile consome e verificar compatibilidade com Flask [23/03/2026]
- [x] **Análise**: Confirmar que Flask admin está rodando em localhost:5000 com conteúdo real [23/03/2026]
- [ ] **Ambiente Dev**: Alterar `EXPO_PUBLIC_DOMAIN` em `.env` de `192.168.0.101:5001` para `192.168.0.101:5000` [23/03/2026]
- [ ] **Ambiente Dev**: Alterar `EXPO_PUBLIC_DOMAIN` em `.env.development` de `192.168.0.101:5001` para `192.168.0.101:5000` [23/03/2026]
- [ ] **Ambiente Dev**: Remover `DATABASE_URL` (PostgreSQL) de `.env` e `.env.development` pois não é mais usado [23/03/2026]
- [ ] **Ambiente Produção**: Fix `ADMIN_API_URL` em `.env.production` de `http://34.162.38.179` para `http://34.162.38.179:5000` (porta faltando) [23/03/2026]
- [ ] **Ambiente Produção**: Alterar `EXPO_PUBLIC_DOMAIN` em `.env.production` de `34.162.38.179:5001` para `34.162.38.179:5000` [23/03/2026]
- [ ] **Ambiente Produção**: Remover `DATABASE_URL` (PostgreSQL) de `.env.production` [23/03/2026]
- [ ] **Verificação**: Reiniciar Expo com `npx expo start -c` (limpar cache do Metro) [23/03/2026]
- [ ] **Verificação**: Confirmar nos logs do Metro que chamadas apontam para `:5000` (`[API] GET http://192.168.0.101:5000/api/discover`) [23/03/2026]
- [ ] **Verificação**: Confirmar que `Discover Data` não é `undefined` e `Error` é `null` nos logs [23/03/2026]
- [ ] **Verificação**: Confirmar visualmente que a tela Discover exibe stories, awards, quero cards e recomendações [23/03/2026]
- [ ] **Git**: Commitar alterações com mensagem `fix: apontar mobile direto ao Flask admin, remover dependência Express/PostgreSQL` [23/03/2026]

## Arquivos Afetados

| Arquivo | Ação | Alteração |
|---------|------|-----------|
| `.env` | Modificar | Porta 5001→5000, remover DATABASE_URL |
| `.env.development` | Modificar | Porta 5001→5000, remover DATABASE_URL |
| `.env.production` | Modificar | Porta 5001→5000, Fix ADMIN_API_URL (add :5000), remover DATABASE_URL |

**Nenhum arquivo de código precisa ser alterado.** A mudança é 100% configuracional.
