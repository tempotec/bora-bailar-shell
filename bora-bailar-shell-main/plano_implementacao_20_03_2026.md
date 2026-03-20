# Plano de Implementação Atômico — BoraBailar Shell
**Data:** 20/03/2026
**Projeto:** bora-bailar-shell (Expo/React Native + Express + Flask Admin)

---

## Commits realizados hoje (20/03/2026)

- [x] **Feature**: Separar ambientes dev/prod — unificar ADMIN_BASE, criar templates .env [20/03/2026]
- [x] **Fix**: Resolver bugs críticos da Rodada 1 (buscar com 3 campos, rolagem Momento/Dicas, botões ReelsScreen, destaques só 3) [20/03/2026]
- [x] **Style**: Ajustes visuais da Rodada 2 (B vermelho, Top Dance fundo cinza, AQUI menor, títulos padronizados) [20/03/2026]
- [x] **Feature**: Rodadas 3–5 — Microfone maior, subtítulo Querer, fundo cinza Momento, upload branco, chat com B maiúsculo e fallback [20/03/2026]
- [x] **Fix**: Adicionar fallback mock para querer e awards quando API retorna vazio [20/03/2026]
- [x] **Feature**: Link clicável "Casa da Criança com Câncer" na seção Dançando por Uma Causa [20/03/2026]
- [x] **Feature**: Rodada 4 — Botão limpar filtros, título parcerias, tipo de parceria padronizado [20/03/2026]
- [x] **Fix**: Corrigir mapeamento dos quero cards — "profissionais de dança" e "sair para dançar" não eram reconhecidos [20/03/2026]

---

## Arquivos modificados hoje

- `client/screens/DiscoverScreen.tsx` — Buscar, rolagem, seções visuais, mic, upload, limpar filtros, beneficência
- `client/screens/ReelsScreen.tsx` — Botões com Alert/navegação
- `client/screens/LoginScreen.tsx` — B vermelho padronizado
- `client/screens/SignUpScreen.tsx` — B vermelho padronizado
- `client/screens/AIChatScreen.tsx` — B vermelho, BoraBailar com B maiúsculo, fallback de resposta
- `client/components/WizardSearchModal.tsx` — Buscar desabilitado quando incompleto
- `client/components/PartnersCarousel.tsx` — Títulos "Seja Parceiro do BoraBailar" e "Escolha o Seu Tipo de Parceria"
- `client/constants/theme.ts` — Tokens titleRed / titleGray
- `client/services/api.ts` — Fallback mock, fix mapeamento quero cards, preservar descrições da API
- `.env` / `.env.development` / `.env.production` — Separação de ambientes

---

## Itens concluídos (32/39)

- [x] #0 B vermelho/cinza padronizado em todas as telas [20/03/2026]
- [x] #1 Centralizar logotipo (já existia) [20/03/2026]
- [x] #2 Login não funciona — proxy para Flask admin já existe [20/03/2026]
- [x] #6 Buscar só ativo com 3 campos preenchidos [20/03/2026]
- [x] #7 Buscar leva ao Explorar (já existia) [20/03/2026]
- [x] #8 Botão limpar/editar preferências no wizard [20/03/2026]
- [x] #11 Diminuir o AQUI (fontSize 22 → 16) [20/03/2026]
- [x] #12 Aumentar ícone do microfone (40px → 52px, ícone 20 → 26) [20/03/2026]
- [x] #13 Tokens de título titleRed + titleGray no theme.ts [20/03/2026]
- [x] #14 Subtítulo "Marque aqui o que você deseja" na seção Querer [20/03/2026]
- [x] #15 Quero só vermelho (já existia) [20/03/2026]
- [x] #17 Fix bug de rolagem em "Momento Dança" (nestedScrollEnabled) [20/03/2026]
- [x] #18 Fundo cinza na seção Momento Dança [20/03/2026]
- [x] #19 Botão upload branco com borda preta [20/03/2026]
- [x] #20 Ícone upload maior (22px) + posicionado à direita [20/03/2026]
- [x] #22 Botões sem operação no ReelsScreen — adicionados Alerts e navegação [20/03/2026]
- [x] #24 Fix bug de rolagem nas Dicas da Semana (nestedScrollEnabled) [20/03/2026]
- [x] #25 Tirar logo do Top Dance Awards [20/03/2026]
- [x] #26 Título "BoraBailar TOP 10 DANCE AWARDS" [20/03/2026]
- [x] #28 "Bora Bailar" com B maiúsculos no chat IA [20/03/2026]
- [x] #29 "Criar conta" em vermelho (já existia) [20/03/2026]
- [x] #30 Interação sem resposta — fallback amigável adicionado [20/03/2026]
- [x] #31 Fundo cinza na seção Top Dance Awards [20/03/2026]
- [x] #33 Layout dos Queros para Parcerias (já ok) [20/03/2026]
- [x] #34 Título "Seja Parceiro do BoraBailar" [20/03/2026]
- [x] #35 Padronizar títulos Marcas Parceiras [20/03/2026]
- [x] #36 "Escolha o Seu Tipo de Parceria" [20/03/2026]
- [x] #37 Vídeos de Destaque: só 3, sem rolagem lateral [20/03/2026]
- [x] #38 Seção renomeada para "Dançando por Uma Causa" [20/03/2026]
- [x] #39 Projeto Emanuel em primeiro lugar [20/03/2026]
- [x] Fix: Mapeamento dos quero cards (profissionais, sair para dançar) [20/03/2026]
- [x] Feature: Link clicável Casa da Criança com Câncer [20/03/2026]

---

## Itens pendentes — Próximas tarefas

- [ ] **#3 — Signup não padronizado**: Refatorar `SignUpScreen.tsx` para seguir o mesmo padrão visual do `LoginScreen.tsx`. Remover ícone de ticket, trocar por ícone de log-in. Adicionar formulário de campos (nome, email, senha) com mesma estrutura.
- [ ] **#5 — Calendário mais intuitivo**: Substituir o seletor de data atual por um componente `DateTimePicker` nativo ou componente de calendário visual no `QuandoModal`. Avaliar uso de `@react-native-community/datetimepicker` que já está no projeto.
- [ ] **#16 — Títulos Full Experience (dinâmicos via API)**: O frontend já suporta `homeTexts?.quero_section_title` e `homeTexts?.momento_title` com fallback. Verificar se o endpoint `/api/discover` do Flask admin envia esses campos. Se não, adicionar no admin.
- [ ] **#21 — Upload sem permissão**: No fluxo de upload, verificar se `expo-image-picker` solicita permissão de câmera/galeria corretamente antes de abrir. Adicionar tratamento de erro caso permissão seja negada.
- [ ] **#23 — Cadastro sobre vídeo sem parar reprodução**: No `ReelsScreen.tsx`, ao navegar para cadastro, garantir que o vídeo continue ou seja pausado/retomado corretamente. Verificar estado do player ao retornar.
- [ ] **#32a — Destaque do Mês título dinâmico**: O título "Destaques do Mês" está hardcoded. Adicionar suporte a `homeTexts?.destaque_mes_title` com fallback no `DiscoverScreen.tsx`.
- [ ] **#4 — Vídeo com fundo claro**: Depende de upload via admin Flask. Verificar se o vídeo do hero está com thumbnail/fundo adequado.
- [ ] **#27 — Categorias 8, 9, 10**: Configurar as categorias adicionais via painel admin Flask. Sem alteração de código necessária.
- [ ] **#32b — Atualizar banco com outros vídeos**: Cadastrar novos vídeos via admin Flask. Sem alteração de código necessária.

---

## Verificação e qualidade

- [ ] **Análise**: Verificar que os 10 arquivos modificados hoje compilam sem erros TypeScript (`npx tsc --noEmit`)
- [ ] **Frontend**: Testar hot reload do Expo em dispositivo físico — validar todas as seções da DiscoverScreen
- [ ] **Frontend**: Verificar que o botão "Limpar filtros" aparece e funciona corretamente no wizard
- [ ] **Frontend**: Confirmar que os 6 quero cards renderizam com títulos e imagens corretas (dados reais da API)
- [ ] **Frontend**: Testar link "Casa da Criança com Câncer" — deve abrir browser externo
- [ ] **Frontend**: Testar chat IA — mensagem de fallback aparece ao digitar texto não reconhecido
- [ ] **Backend**: Validar que `/api/discover` retorna todos os campos esperados (queroCards, awards, weeklyTips, homeTexts)
- [ ] **Backend**: Confirmar que separação de ambientes `.env.development` / `.env.production` funciona corretamente
