# BoraBailar — Documentação Técnica do Projeto

### Descrição Resumida

O BoraBailar é uma plataforma mobile-first voltada para o ecossistema da dança social no Rio de Janeiro. O sistema conecta dançarinos, organizadores de eventos, parceiros comerciais e marcas através de um aplicativo React Native/Expo que consome dados de duas camadas backend: um servidor Express/Node.js (Shell Backend) responsável pela API pública e lógica do app, e um painel administrativo Python/Flask (Content Admin) responsável pelo gerenciamento de conteúdo, uploads de mídia e curadoria editorial. O banco de dados é PostgreSQL, compartilhado entre ambos os backends, com esquemas sincronizados via Drizzle ORM (Shell) e SQLAlchemy (Admin). A infraestrutura de produção roda em Google Cloud (IP: 34.162.38.179) com Gunicorn + Nginx na porta 80.

### Problema/Oportunidade

O mercado de dança social no Rio de Janeiro é altamente fragmentado. Dançarinos não possuem uma ferramenta centralizada para descobrir eventos por zona, estilo de dança, dia da semana ou tipo de acompanhamento (solo, amigos, grupo). Organizadores e parceiros dependem de redes sociais genéricas para divulgação, perdendo alcance e rastreabilidade. O BoraBailar ataca essa lacuna criando um marketplace vertical de dança, onde a curadoria editorial (Awards, Dicas da Semana, Quero Cards) agrega valor além de um simples agregador de eventos. A oportunidade de receita está na monetização via parceiros comerciais (marcas, escolas de dança, casas noturnas) que ganham visibilidade segmentada para o público dançarino.

### Objetivos

- Oferecer uma experiência mobile nativa para descoberta de eventos de dança, com filtros por zona geográfica, categoria, data e tipo de acompanhamento.
- Permitir a gestão editorial completa via painel admin, incluindo: textos editáveis da Home (15 chaves), Quero Cards, Partner Cards, Partner Brands, Top Dance Awards, Dicas da Semana e feed de vídeos.
- Implementar autenticação segura com JWT (Bearer Token), armazenamento via expo-secure-store no mobile e HTTP-only cookies no admin.
- Fornecer uma API RESTful unificada (`/api/discover`) que agrega todo o conteúdo da Home em uma única chamada, com endpoints dedicados para cada seção.
- Suportar busca por voz via transcrição de áudio com OpenAI Whisper integrado ao backend Express.
- Manter dois backends operando sobre o mesmo banco PostgreSQL, garantindo consistência de dados entre o admin editorial e a API pública do app.

### Alinhamento Estratégico

A arquitetura do projeto foi desenhada para escalar em duas dimensões: conteúdo e distribuição. O uso de React Native/Expo permite publicação simultânea em iOS e Android com um único codebase, enquanto o sistema EAS Update viabiliza atualizações OTA (Over-The-Air) sem submissão nas stores. O backend Express com Drizzle ORM oferece tipagem end-to-end (TypeScript compartilhado via pasta `shared/schema.ts`) e migrations programáticas. O painel Flask garante que a equipe editorial não dependa de desenvolvedores para atualizar textos, imagens e seções da Home — tudo é gerenciável por interface web com preview em tempo real (Phone Frame Preview). O esquema de Home Builder (tabelas `home_sections` e `home_section_items`) permite reorganizar seções inteiras da Home sem deploy, desacoplando conteúdo de código. A adoção de PostgreSQL como banco unificado evita sincronização entre datastores e permite queries complexas com índices compostos para performance em janelas temporais de conteúdo.

### Escopo do Projeto

**Backend Shell (Express/Node.js — `server/`)**
- Servidor Express com 5 módulos de rotas: `routes.ts` (API principal com busca por voz via OpenAI), `admin-routes.ts` (autenticação admin), `crud-routes.ts` (CRUD genérico para todas as entidades), `public-routes.ts` (endpoints públicos do app: discover, eventos, vídeos, awards, preview codes), `home-builder-routes.ts` (gestão de seções e itens da Home).
- Drizzle ORM com 14 tabelas: `users`, `venues`, `admin_users`, `partners`, `events`, `videos`, `award_categories`, `quero_cards`, `tips`, `preview_codes`, `favorites`, `event_attendees`, `home_sections`, `home_section_items`, `app_settings`.
- Integração OpenAI (GPT-5 / Whisper) para transcrição de áudio e busca inteligente.
- Landing page dinâmica com template HTML para download nas stores.
- WebSocket support via `http.createServer`.

**Backend Admin (Python/Flask — servidor separado)**
- Painel administrativo completo com CRUD para: Eventos, Places, Vídeos, Awards (multi-edição), Quero Cards, Tips, Partner Cards, Partner Brands, Home Texts.
- Upload de imagens nativo para `/static/uploads/` com categorias organizadas (quero/, awards/, events/, videos/).
- Audit log para rastreio de modificações de conteúdo.
- API REST consumida pelo app: `/api/content/home`, `/api/content/quero`, `/api/content/partner-cards`, `/api/content/partner-brands`, `/api/content/awards/active`, `/api/content/tips/weekly-events`, `/api/videos/feed`, `/api/auth/*`.
- Autenticação JWT com bcrypt, endpoints de registro, login, perfil e troca de senha.
- Deploy em produção com Gunicorn + Nginx (porta 80) em Google Cloud.

**Frontend Mobile (React Native/Expo 54 — `client/`)**
- 18 telas: DiscoverScreen (Home), ExplorarScreen (busca), ReelsScreen (vídeos), MessagesScreen, ChatScreen, AIChatScreen, ProfileScreen, EditProfileScreen, LoginScreen, SignUpScreen, RegisterStep1/Step2, CadastreSeScreen, FaltaPoucoScreen, EventDetailsScreen, QueroDetailScreen, SearchResultsScreen, MyEventsScreen.
- 14 componentes reutilizáveis: PartnersCarousel, PartnerBrands, SearchModals, WizardSearchModal, ExploreComponents, Button, Card, ErrorBoundary, ErrorFallback, HeaderTitle, Spacer, ThemedText, ThemedView, KeyboardAwareScrollViewCompat.
- 7 navegadores (React Navigation): RootStack, MainTab (5 abas), DiscoverStack, ChatStack, MessagesStack, MyEventsStack, ProfileStack.
- 6 serviços: `realApi.ts` (API client principal com 8 módulos), `apiClient.ts` (client HTTP autenticado com token injection), `authService.ts` (register/login/me/changePassword/updateProfile), `tokenStore.ts` (expo-secure-store com fallback localStorage), `videoService.ts` (gestão de vídeos), `api.ts` (abstração de switching mock/real).
- 15 textos dinâmicos da Home consumidos via `/api/content/home` com fallback hardcoded.
- TanStack React Query para cache e gerenciamento de estado de dados.
- Suporte a FlashList (Shopify) para performance otimizada no ReelsScreen.
- Animações com React Native Reanimated e efeitos com expo-blur e expo-glass-effect.

### Fora do Escopo

- Sistema de pagamento e checkout (ingressos definem preços, mas não há gateway de pagamento integrado).
- Notificações push (não há integração com FCM ou APNs).
- Chat em tempo real (MessagesScreen e ChatScreen existem como UI, mas não possuem backend de mensageria WebSocket persistente).
- Geolocalização em tempo real (expo-location está instalado, mas não há funcionalidade de "eventos próximos" baseada em GPS ativo).
- Envio de vídeos pelo usuário (o botão "Envie seu vídeo" existe na UI, mas o fluxo de upload do app para o server não está implementado no client).
- Sistema de avaliações e reviews de eventos ou venues.
- Dashboard de analytics para parceiros (métricas de visualização, conversão).
- Internacionalização (i18n) — o app opera exclusivamente em Português do Brasil.
- Modo offline / cache persistente de dados.
- Testes automatizados (unitários, integração ou E2E).

### Premissas

- **Stack Mobile**: React Native 0.81.5, Expo SDK 54, TypeScript 5.9, React 19.1.
- **Stack Backend Shell**: Node.js + Express 4.21, Drizzle ORM 0.39, Zod 3.24 para validação, PostgreSQL 8.x (driver `pg`).
- **Stack Backend Admin**: Python 3.12+, Flask, SQLAlchemy, Jinja2, Gunicorn, Nginx.
- **Banco de Dados**: PostgreSQL compartilhado entre Shell e Admin, com UUIDs como chaves primárias (`gen_random_uuid()`).
- **Autenticação**: JWT (Bearer Token) com bcrypt para hash de senhas. Tokens armazenados via expo-secure-store (native) ou localStorage (web).
- **Gerenciamento de Estado**: TanStack React Query v5 para data fetching, React Context para autenticação.
- **Navegação**: React Navigation v7 com bottom tabs e native stacks.
- **Mídia**: Uploads processados pelo admin Flask e servidos via `/static/uploads/`. URLs relativas são resolvidas no client via `buildImageUrl()`.
- **Deploy**: EAS Build/Update para distribuição mobile, Gunicorn + Nginx para backend admin, Express servindo na porta configurável (padrão 5001).
- **Padrão de API**: Respostas em snake_case do admin Flask, com conversão camelCase via `mapKeys()` no `fetchJson()` do Shell. O endpoint `/content/home` usa fetch raw para preservar snake_case (compatibilidade com chaves do admin).

### Restrições

- **HTTP em Produção**: O backend roda em HTTP (sem SSL/TLS). iOS pode bloquear requisições HTTP puras via App Transport Security (ATS) em builds de produção, exigindo configuração de exceção ou migração para HTTPS.
- **Banco Compartilhado**: Ambos os backends (Shell e Admin) operam no mesmo PostgreSQL, o que exige sincronização manual de migrations entre Drizzle (Shell) e SQLAlchemy (Admin). Alterações de schema em um backend podem quebrar o outro se não coordenadas.
- **Expo Go vs Build de Produção**: O Expo Go opera sempre em modo `__DEV__=true`, o que impede o uso de variáveis condicionais para trocar entre URLs de desenvolvimento e produção. A URL de produção está hardcoded no `config.ts`.
- **Sem CDN para Mídia**: Imagens e vídeos são servidos diretamente pelo Nginx/Flask a partir do filesystem local do servidor. Não há CDN, o que limita performance e escalabilidade de mídia para usuários distantes do servidor.
- **Ausência de Testes**: Não existem testes automatizados (unitários, integração ou E2E) em nenhuma das camadas do projeto, aumentando o risco de regressão em mudanças.
- **Dados Mock Residuais**: O `storage.ts` do Shell Backend contém 15 eventos filtrados hardcoded como constante `FILTERED_EVENTS`, misturando dados reais do banco com dados estáticos no código.
- **Limite de Assets EAS**: O EAS Update possui limite de 2.000 assets por update. O projeto atual opera com 123 assets por plataforma, dentro do limite, mas uploads massivos de mídia poderiam ultrapassá-lo.
- **Dependência de IP Fixo**: A URL de produção aponta para um IP (`34.162.38.179`) ao invés de um domínio, dificultando migração de servidor e impossibilitando HTTPS via Let's Encrypt sem domínio.
