Especificação de Design 

Versão: 1 

Especificação de UX Design – Ferramenta de Gestão Logística da Perfumaria 

 

1. Visão Geral 

 

Ferramenta web (desktop-first, responsiva) para gestão logística de uma perfumaria especializada em decants, alinhada ao PRD fornecido (controle de estoque, pedidos, insumos, custos, relatórios, etc.), desenhada para uso principal em desktop com suporte adequado a tablets e celulares. 

 

• **Público principal**: dono/gestor da perfumaria e, eventualmente, assistentes administrativos. 

• **Contexto de uso**: uso diário, em sessões longas, geralmente no escritório ou home office. 

• **Objetivo central**: dar controle claro e confiável sobre estoque, operações logísticas e desempenho da perfumaria, com mínimo atrito e forte visibilidade de riscos (faltas, vencimentos, erros). 

 

--- 

 

2. Arquitetura de Informação e Navegação 

 

2.1 Estrutura de navegação principal 

 

Navegação lateral fixa (sidebar) em desktop, colapsável; em mobile, vira menu tipo “hamburger”. 

 

Itens principais (ajustados ao PRD típico de logística da perfumaria): 

 

1. **Dashboard** 

2. **Estoque** 

   - Visão geral de produtos 

   - Lotes / Validade 

3. **Pedidos** 

   - Pedidos em aberto 

   - Histórico 

4. **Insumos e Produção** 

   - Insumos (frascos, etiquetas, matérias-primas) 

   - Ordens de produção/decantação 

5. **Clientes / Fornecedores** 

6. **Relatórios** 

7. **Configurações** 

 

2.2 Padrão de layout (desktop-first) 

 

• **Header superior** (altura ~56px): 

  - Logotipo/nome da perfumaria (esquerda) 

  - Campo de busca global (centro) 

  - Ações rápidas (ícones): notificações, ajuda, usuário/perfil (direita) 

• **Sidebar esquerda** (~260px expandido, 64px colapsado): 

  - Ícones + texto para cada seção 

  - Estado ativo destacado 

• **Área de conteúdo**: 

  - Título da página 

  - Breadcrumb (ex.: Estoque > Lotes) 

  - Filtros e ações principais 

  - Tabela/listas ou cards 

• **Footer opcional**: links institucionais, versão do sistema. 

 

2.3 Responsividade 

 

• **≥ 1024px (desktop)**: sidebar fixa, tabelas completas, múltiplas colunas. 

• **768–1023px (tablet)**: sidebar colapsada; filtros em acordeão; tabelas com algumas colunas agrupadas. 

• **≤ 767px (mobile)**: 

  - Menu lateral acessado via ícone. 

  - Tabelas convertidas em cards responsivos, destacando campos chave (nome do perfume, estoque, validade, status do pedido). 

  - Ações principais em bottom bar fixa quando relevante (ex.: em Pedidos: “Novo pedido”). 

 

--- 

 

3. Fluxos Principais (User Journeys) 

 

3.1 Fluxo: Controle de Estoque de Decants (Happy Path) 

 

Objetivo: ver rapidamente quais perfumes estão com estoque baixo ou vencendo, e registrar ajustes. 

 

1. Usuário acessa **Dashboard** ao logar. 

2. Vê cards e alertas: 

   - “Perfumes com estoque crítico” 

   - “Lotes próximos do vencimento” 

3. Clica em “Ver detalhes” no card de estoque crítico → navega para **Estoque > Produtos** com filtro pré-aplicado “Apenas crítico”. 

4. Na tabela de produtos: 

   - Ordena por “Estoque atual” ascendente. 

   - Clica em um perfume específico. 

5. Modal ou página de detalhes: 

   - Lista de lotes (volume, validade, estado). 

   - Botão “Ajustar estoque”. 

6. Clica em “Ajustar estoque”: 

   - Abre formulário com: 

     - Campo “Tipo de ajuste” (entrada, saída, correção). 

     - Quantidade. 

     - Motivo (campo texto). 

   - Validações em tempo real. 

7. Ao salvar: 

   - Feedback visual: MessageBar de sucesso. 

   - Atualização imediata da tabela. 

 

Estados de erro/edge cases: 

• Tentativa de ajuste com quantidade negativa ou zero → mensagem inline, botão “Salvar” desabilitado. 

• Falha de rede ao salvar → MessageBar de erro com opção “Tentar novamente”. 

• Conflito de concorrência (outro usuário ajustou antes) → mensagem “Os dados foram atualizados por outra pessoa; recarregue para ver o novo estoque”. 

 

3.2 Fluxo: Gestão de Pedidos (do registro ao envio) 

 

1. Usuário acessa **Pedidos > Em aberto**. 

2. Tabela apresenta: 

   - Número do pedido. 

   - Cliente. 

   - Status (Novo, Em preparação, Enviado). 

   - Data. 

   - Valor total. 

3. Clica em “Novo pedido”. 

4. Formulário de criação: 

   - Seleção de cliente (AutoComplete). 

   - Adição de itens: 

     - Campo de busca de perfume (nome/nota/marca). 

     - Seleção de volume (ml) e tipo de decant. 

     - Quantidade. 

     - Validação de estoque disponível (com mensagem de alerta se ficar abaixo do mínimo). 

5. Ao clicar em “Salvar e preparar”: 

   - Status do pedido → “Em preparação”. 

   - Geração de uma lista de picking (itens a separar) com volumes. 

6. Em “Em preparação”, usuário registra: 

   - Confirmar itens preparados. 

   - Botão “Marcar como enviado” (exige informação de método de envio/código de rastreio). 

7. Ao marcar como enviado: 

   - Feedback de sucesso. 

   - Pedido movido para “Histórico” com status “Enviado”. 

 

Cenários de erro: 

• Estoque insuficiente para um item → bloqueio da ação, sugestão de reduzir quantidade ou criar ordem de produção. 

• Dados obrigatórios faltando (cliente, endereço de envio se aplicável) → mensagens inline e focus no campo. 

 

3.3 Fluxo: Gestão de Insumos e Produção de Decants 

 

1. Usuário acessa **Insumos e Produção > Insumos**: 

   - Tabela com frascos, sprays, etiquetas, matérias-primas, etc. 

   - Alertas de insumos em baixa. 

2. Clica em **“Nova ordem de produção”**. 

3. Formulário: 

   - Selecionar perfume base. 

   - Definir volumes a produzir (ex.: 10 x 5ml, 5 x 10ml). 

   - Sistema calcula insumos necessários baseado em regras (do PRD). 

   - Indica se há insumos suficientes (ok/alerta). 

4. Ao salvar: 

   - Ordem com status “Planejada”. 

5. Em detalhe da ordem: 

   - Botão “Iniciar produção” → status “Em produção”. 

   - Campos para registrar perdas/ajustes. 

   - Botão “Concluir produção”: 

     - Gera novos lotes de estoque de produtos. 

     - Debita insumos usados. 

6. Feedback de sucesso e link direto para ver novos lotes em **Estoque > Lotes**. 

 

Erros e validações: 

• Tentar iniciar produção com insumos insuficientes → alerta forte, opção de “Registrar assim mesmo” (se permitido no PRD) com justificativa obrigatória. 

• Cancelar ordem após produção iniciada → exige registro detalhado da justificativa. 

 

--- 

 

4. Especificação de Telas e Componentes 

 

4.1 Dashboard 

 

Objetivo: visão geral da saúde logística da perfumaria. 

 

Layout: 

• **Header da página**: 

  - Título: “Dashboard” 

  - Filtro de período (Hoje, Últimos 7 dias, Últimos 30 dias, Customizado). 

• **Seção 1: Resumo de KPIs** (cards em grid 2x2 no desktop): 

  - Total de pedidos no período. 

  - Faturamento estimado. 

  - Perfumes com estoque crítico. 

  - Lotes próximos do vencimento. 

• **Seção 2: Alertas**: 

  - MessageBars listando: 

    - “3 perfumes com estoque abaixo do mínimo.” 

    - “2 lotes vencendo em até 7 dias.” 

• **Seção 3: Gráfico simples** (Fluent Charts ou equivalente): 

  - Pedidos por dia (linha/colunas). 

• **Seção 4: Tabela “Atividades recentes”**: 

  - Últimos ajustes de estoque. 

  - Últimos pedidos criados. 

 

Componentes (Fluent): 

• Cards (Stack + Surface). 

• MessageBar (info/warning). 

• DatePicker/Dropdown para período. 

• DetailsList para tabelas. 

• Chart (com alto contraste). 

 

Estados da interface: 

• **Empty**: se não houver dados (ex.: perfumaria recém-iniciada), mostrar mensagens amigáveis: “Comece cadastrando seus perfumes e insumos.” 

• **Loading**: Skeletons para cards e placeholders nas tabelas/gráficos. 

• **Error**: MessageBar com “Não foi possível carregar o dashboard. Tentar novamente”. 

 

--- 

 

4.2 Estoque – Produtos 

 

Objetivo: gerenciar perfumes/decants, volumes e estoque. 

 

Layout: 

• Header: 

  - Título: “Estoque – Produtos”. 

  - Botão principal: “Novo perfume/decant”. 

  - Ícone de filtro avançado. 

• Filtros: 

  - Busca por nome/marca/notas. 

  - Dropdown: Status (Ativo/Inativo). 

  - Checkbox: “Somente críticos”. 

• Tabela (DetailsList): 

  - Colunas: 

    - Nome do perfume. 

    - Marca. 

    - Volume padrão(s). 

    - Estoque atual (unidades). 

    - Estoque mínimo. 

    - Status de estoque (OK, Crítico, Ruptura) com pill colorido. 

    - Ações (ícone para ver detalhes, ajustar estoque). 

• Ações por linha: 

  - “Detalhes” (navega para página do perfume). 

  - “Ajustar estoque” (abre painel/Modal). 

 

Estados: 

• Empty (nenhum perfume cadastrado): card explicativo + CTA “Cadastrar primeiro perfume”. 

• Loading: shimmer nas linhas. 

• Error: MessageBar. 

 

Acessibilidade: 

• Tabela com cabeçalhos <th>, leitura coerente por leitores de tela. 

• Ícones de status com label textual (aria-label: “Estoque crítico” etc.). 

• Foco visível em filtros e linhas selecionadas. 

 

--- 

 

4.3 Estoque – Detalhe do Produto 

 

Objetivo: ver perfil de um perfume e seus lotes. 

 

Layout: 

• Header: 

  - Nome do perfume, marca. 

  - Tags (ex.: “Exclusivo”, “Importado” se aplicável). 

• Subnavegação (Pivot/Tab): 

  - “Resumo”. 

  - “Lotes”. 

  - “Histórico de estoque”. 

• **Tab Resumo**: 

  - Card com: 

    - Estoque total atual (unidades). 

    - Rupturas recentes. 

    - Estoque mínimo configurado. 

  - Botões: 

    - “Ajustar estoque”. 

    - “Editar dados”. 

• **Tab Lotes**: 

  - Tabela com colunas: 

    - Lote ID. 

    - Volume (ml). 

    - Quantidade. 

    - Validade (data, realçada se próxima ou vencida). 

    - Status (Valendo, Próximo do vencimento, Vencido). 

• **Tab Histórico**: 

  - Lista cronológica de ajustes com: 

    - Data/hora. 

    - Tipo de ajuste. 

    - Quantidade. 

    - Motivo. 

    - Usuário. 

 

--- 

 

4.4 Pedidos – Em aberto e Histórico 

 

Em aberto: 

• Filtros: 

  - Status (Novo, Em preparação). 

  - Período. 

  - Cliente. 

• Tabela: 

  - ID, Cliente, Data, Valor, Status, Ações. 

• Botão: “Novo pedido”. 

 

Detalhe do pedido: 

• Header: 

  - ID, Cliente, Status (com pill). 

  - Ações contextuais: 

    - “Editar” (enquanto status permitir). 

    - “Cancelar pedido”. 

    - “Marcar como preparado”. 

    - “Marcar como enviado”. 

• Seções: 

  - Dados do cliente (endereço, contato). 

  - Lista de itens (perfume, volume, quantidade, preço). 

  - Resumo financeiro (subtotal, frete, total). 

• Feedback de transição de status com MessageBar. 

 

--- 

 

4.5 Insumos e Produção 

 

Insumos: 

• Tabela de insumos com: 

  - Nome. 

  - Categoria (frasco, etiqueta, matéria-prima). 

  - Estoque atual. 

  - Estoque mínimo. 

  - Fornecedor preferencial. 

• Botão: “Novo insumo”. 

 

Ordens de produção: 

• Lista de ordens com status (Planejada, Em produção, Concluída, Cancelada). 

• Detalhe da ordem: 

  - Perfume/decant alvo. 

  - Volumes/quantidades. 

  - Insumos necessários vs disponíveis. 

  - Botões de mudança de status (Iniciar, Concluir, Cancelar). 

 

--- 

 

5. Padrões Visuais e Fluent Design 

 

5.1 Tipografia e Hierarquia 

 

• Base em Fluent: 

  - Títulos: Title 1/2/3 conforme nível. 

  - Corpo: Body 1. 

• Hierarquia: 

  - H1: título da página. 

  - H2: seções principais. 

  - H3: subtítulos locais. 

 

5.2 Cores 

 

• Respeitar Fluent + brand da perfumaria (se já houver). 

• Uso semântico de cor: 

  - Primária: ações principais (botões). 

  - Verde: sucesso. 

  - Âmbar/laranja: atenção (estoque baixo, validade próxima). 

  - Vermelho: erro/ruptura/vencido. 

• Garantir **contraste mínimo 4.5:1** para texto normal, 3:1 para títulos. 

 

5.3 Componentes Fluent recomendados 

 

• **Navigation**: Nav para sidebar, Pivot para tabs, Breadcrumb. 

• **Inputs**: TextField, ComboBox, Dropdown, DatePicker, SpinButton (para quantidades). 

• **Feedback**: MessageBar, Dialog, TeachingBubble (para onboarding). 

• **Data**: DetailsList para tabelas, Charts (quando disponível). 

• **Layout**: Stack, Grid, Panel/Modal. 

 

--- 

 

6. Estados da Interface e Mensagens 

 

6.1 Estados Globais 

 

• **Loading global**: Spinner central + texto “Carregando dados…”. 

• **Offline/erro de rede**: 

  - Banner no topo: “Você está offline. Algumas ações podem não funcionar.” 

  - Tentativas de salvamento são enfileiradas ou bloqueadas conforme decisão técnica. 

 

6.2 Padrão de ERROS de formulário 

 

• Validação em tempo real (onBlur ou onChange controlado). 

• Mensagem abaixo do campo, clara e específica (ex.: “Informe um número maior que zero”). 

• Foco automático no primeiro campo com erro ao tentar salvar. 

 

--- 

 

7. Acessibilidade (WCAG AA) 

 

• Navegação total via teclado: 

  - Ordem de tab coerente. 

  - Atalhos (ex.: Alt+N para “Novo pedido”, Alt+E para “Novo perfume”) documentados em um painel de ajuda. 

• Leitores de tela: 

  - Labels explícitos em todos os inputs. 

  - aria-label em ícones de ação. 

  - Descrição textual de gráficos e cards com dados críticos. 

• Mensagens de estado: 

  - Uso de `role="status"` ou `aria-live="polite"` em MessageBars para que leitores de tela avisem feedback de sucesso/erro. 

• Responsividade e tamanho de alvo: 

  - Botões e links com área mínima de clique recomendada (44x44px). 

 

--- 

 

8. Componentes Reutilizáveis 

 

• **Card de KPI**: 

  - Ícone opcional, valor principal, descrição, link “Ver detalhes”. 

• **Tabela padrão**: 

  - Cabeçalho, ordenação, barra de filtros, paginação. 

• **Formulário de criação/edição**: 

  - Layout com duas colunas em desktop, uma coluna em mobile. 

  - Área de ações fixa (Salvar/Cancelar). 

• **Painel de ajuste de estoque**: 

  - Reutilizado em Produtos e eventualmente em Insumos. 

• **Painel de alteração de status** (Pedidos, Ordens de produção): 

  - Confirmação de status + campo de justificativa opcional/obrigatório. 

 

--- 

 

9. Considerações Regulatórias e de Dados 

 

⚠️ ALERTA DE COMPLIANCE (LGPD)   

Mesmo sendo uma ferramenta interna, se houver dados pessoais de clientes (nome, telefone, endereço): 

 

• Interfaces de cadastro de clientes devem: 

  - Exibir claramente quais dados são necessários e para quê. 

  - Evitar coleta de dados sensíveis não necessários. 

• Telas com dados pessoais devem: 

  - Permitir correção e remoção mediante processo interno. 

• Logs de atividade: 

  - Deixar claro em interface de auditoria que certas ações registram quem alterou dados (para transparência e rastreabilidade). 

 

--- 

 

10. Ferramentas sugeridas para prototipação 

 

• **Figma**: 

  - Uso da library de Fluent UI (componente web ou React) para acelerar protótipos. 

  - Criação de um Design System leve para a perfumaria (cores, estilos de texto, componentes). 

• **Lovable / v0**: 

  - Experimentar geração inicial de telas com prompts, depois refinar sobre os wireframes para garantir os fluxos e acessibilidade especificados. 

 

--- 

 

11. Decisões de Design Pendentes (a validar em iteração futura) 

 

• Níveis de **detalhe de relatório** necessários (por produto, por cliente, por canal de venda) e respectivos filtros. 

• Se haverá **multi-usuário** com diferentes perfis (ex.: operador vs. administrador) e, portanto, diferentes permissões de acesso a telas/ações. 

• Política exata para **produtos/lotes vencidos**: podem ser vendidos com desconto, apenas marcados como não vendáveis, ou exigem descarte registrado em interface própria. 

• Estratégia de **offline/baixa conectividade**: se será apenas um sistema online ou se precisa de algum suporte a uso intermitente. 