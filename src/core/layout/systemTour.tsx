import type { Step } from "react-joyride";

export interface SystemTourStep extends Step {
  route: string;
  beforeTargetSelector?: string;
}

export interface SystemTourSection {
  id: string;
  title: string;
  description: string;
  steps: SystemTourStep[];
  subsections?: SystemTourSection[];
}

function tourStep(route: string, target: string, title: string, content: string, beforeTargetSelector?: string): SystemTourStep {
  return {
    route,
    target: `[data-tour="${target}"]`,
    title,
    content,
    beforeTargetSelector,
    disableBeacon: true,
    placement: "bottom",
  };
}

export function getSystemTourSections(isAdmin: boolean): SystemTourSection[] {
  const sections: SystemTourSection[] = [
    {
      id: "home",
      title: "Início",
      description: "Visão geral e atalhos do seu perfil.",
      steps: [
        tourStep("/", "tour-home-heading", "Início", "Este é o ponto de partida. A navegação lateral permite acessar as áreas liberadas para seu perfil."),
        ...(isAdmin ? [
          tourStep("/", "tour-home-kpis", "Indicadores", "Acompanhe vendas, faturamento, margem e ticket médio do período selecionado."),
          tourStep("/", "tour-home-charts", "Evolução do período", "Compare a quantidade de vendas e o faturamento por hora, dia ou mês."),
          tourStep("/", "tour-home-products", "Desempenho de produtos", "Veja os produtos mais vendidos e a distribuição da receita por categoria."),
          tourStep("/", "tour-home-operations", "Operação diária", "Acompanhe alertas de estoque e as vendas recentes; os atalhos levam às ações relacionadas."),
        ] : [tourStep("/", "tour-home-employee-actions", "Atalhos de trabalho", "Use estes atalhos para registrar uma venda ou acompanhar pedidos online.")]),
      ],
    },
    ...(isAdmin ? [
      {
        id: "products",
        title: "Estoque · Produtos",
        description: "Catálogo, filtros e manutenção dos produtos.",
        steps: [
          tourStep("/estoque/produtos", "tour-products-header", "Produtos", "Consulte o catálogo, cadastre itens e edite estoque, preços e informações dos produtos."),
          tourStep("/estoque/produtos", "tour-products-filters", "Filtros do estoque", "Pesquise por nome ou marca e refine a lista por categoria e status do estoque."),
          tourStep("/estoque/produtos", "tour-products-table", "Lista de produtos", "Ordene as colunas, navegue pelas páginas e use as ações de edição ou exclusão."),
        ],
      },
      {
        id: "categories",
        title: "Estoque · Categorias",
        description: "Organização e vínculos das categorias.",
        steps: [
          tourStep("/estoque/categorias", "tour-categories-header", "Categorias", "Cadastre e mantenha as categorias usadas para organizar os produtos."),
          tourStep("/estoque/categorias", "tour-categories-list", "Categorias cadastradas", "Confira os produtos vinculados e gerencie cada categoria pela tabela."),
        ],
      },
    ] : []),
    {
      id: "decants",
      title: "Decants",
      description: isAdmin ? "Preços e volumes dos frascos de decant." : "Consulte preços e volumes dos frascos de decant.",
      steps: [
        tourStep("/decants", "tour-decants-header", "Decants", isAdmin ? "Cadastre a tabela de preços dos frascos de decant vinculados a perfumes." : "Consulte os preços cadastrados dos frascos de decant vinculados a perfumes."),
        tourStep("/decants", "tour-decants-search", "Buscar decants", "Localize rapidamente um perfume vinculado à tabela de frascos."),
        tourStep("/decants", "tour-decants-table", "Preços por volume", isAdmin ? "Consulte e mantenha os preços de 2 ml, 3 ml, 5 ml e 10 ml." : "Consulte os preços de 2 ml, 3 ml, 5 ml e 10 ml para orientar a venda."),
      ],
    },
    {
      id: "body-splash",
      title: "Body Splash",
      description: isAdmin ? "Preços dos frascos fracionados." : "Consulte os preços dos frascos fracionados.",
      steps: [
        tourStep("/bodysplash", "tour-body-splash-header", "Body Splash", isAdmin ? "Cadastre preços de frascos fracionados vinculados aos produtos Body Splash." : "Consulte os preços de frascos fracionados vinculados aos produtos Body Splash."),
        tourStep("/bodysplash", "tour-body-splash-search", "Buscar Body Splash", "Filtre a lista pelo nome do produto vinculado."),
        tourStep("/bodysplash", "tour-body-splash-table", "Preços por volumetria", "Consulte os preços de 10 ml, 15 ml, 20 ml, 25 ml e 30 ml."),
      ],
    },
    {
      id: "sale",
      title: "Vendas · Registrar",
      description: "Monte e confirme uma venda presencial ou online.",
      steps: [
        tourStep("/vendas/registrar", "tour-sales-header", "Registrar venda", "Monte uma venda presencial ou online. O formulário recalcula os valores conforme os itens e condições escolhidos."),
        tourStep("/vendas/registrar", "tour-sales-channel", "Canal da venda", "Escolha presencial ou online; para venda online, selecione WhatsApp ou Site."),
        tourStep("/vendas/registrar", "tour-sales-customer", "Cliente", "Vincule a venda a um cliente existente ou cadastre um novo cliente."),
        tourStep("/vendas/registrar", "tour-sales-items", "Itens", "Pesquise produtos ou itens fracionados, escolha a apresentação e adicione ao carrinho."),
        tourStep("/vendas/registrar", "tour-sales-cart", "Carrinho", "Revise quantidades, preços e itens antes de concluir o registro."),
        tourStep("/vendas/registrar", "tour-sales-summary", "Resumo e confirmação", "Confira frete, desconto, pagamento e total antes de confirmar a venda."),
      ],
    },
    {
      id: "sales-history",
      title: "Vendas · Histórico",
      description: "Consulta, filtros e detalhes de vendas.",
      steps: [
        tourStep("/vendas/historico", "tour-history-heading", "Histórico de vendas", "Consulte vendas registradas e acompanhe os totais do histórico."),
        tourStep("/vendas/historico", "tour-history-filters", "Filtros do histórico", "Pesquise por venda ou cliente e filtre por pagamento, tipo e status."),
        tourStep("/vendas/historico", "tour-history-results", "Resultados", "Revise os registros. Quando permitido, abra o recibo ou edite uma venda."),
      ],
    },
    {
      id: "online-orders",
      title: "Vendas · Pedidos online",
      description: "Acompanhamento e ações dos pedidos digitais.",
      steps: [
        tourStep("/vendas/pedidos", "tour-orders-heading", "Pedidos online", "Acompanhe pedidos dos canais digitais, incluindo pendências e finalizações."),
        tourStep("/vendas/pedidos", "tour-orders-filters", "Filtros de pedidos", "Pesquise e filtre por status ou canal para localizar um pedido."),
        tourStep("/vendas/pedidos", "tour-orders-results", "Ações dos pedidos", "Abra os detalhes, finalize pedidos, informe rastreio ou cancele quando necessário."),
      ],
    },
    ...(isAdmin ? [
      {
        id: "people-clients",
        title: "Pessoas · Clientes",
        description: "Busca, status e manutenção de clientes.",
        steps: [
          tourStep("/clientes", "tour-people-heading", "Gestão de Pessoas", "Administre clientes, fornecedores e funcionários da organização."),
          tourStep("/clientes", "tour-people-tabs", "Abas de cadastro", "As abas separam os tipos de cadastro; o contador mostra a quantidade de cada grupo."),
          tourStep("/clientes", "tour-people-search", "Busca e status", "Pesquise clientes e filtre registros ativos, inativos ou todos."),
          tourStep("/clientes", "tour-people-results", "Clientes", "Consulte contatos, pedidos e status; as ações permitem editar, inativar ou reativar."),
        ],
      },
      {
        id: "people-suppliers",
        title: "Pessoas · Fornecedores",
        description: "Dados de contato e cadastro de fornecedores.",
        steps: [
          tourStep("/clientes", "tour-people-heading", "Fornecedores", "Use a aba Fornecedores para manter os dados das empresas fornecedoras."),
          tourStep("/clientes", "tour-people-tabs", "Abas de cadastro", "Alterne entre Clientes, Fornecedores e Funcionários."),
          tourStep("/clientes", "tour-people-search", "Busca de fornecedores", "Pesquise por razão social, CNPJ ou e-mail.", "[data-tour='tour-people-tab-suppliers']"),
          tourStep("/clientes", "tour-people-supplier-results", "Lista de fornecedores", "Consulte contato e endereço; as ações permitem editar ou remover um cadastro."),
        ],
      },
      {
        id: "people-employees",
        title: "Pessoas · Funcionários",
        description: "Acesso, perfil e manutenção da equipe.",
        steps: [
          tourStep("/clientes", "tour-people-heading", "Funcionários", "Use a aba Funcionários para administrar as contas de acesso da equipe."),
          tourStep("/clientes", "tour-people-tabs", "Abas de cadastro", "Alterne entre Clientes, Fornecedores e Funcionários."),
          tourStep("/clientes", "tour-people-search", "Busca da equipe", "Localize funcionários pelo nome ou e-mail.", "[data-tour='tour-people-tab-employees']"),
          tourStep("/clientes", "tour-people-employee-results", "Lista de funcionários", "Confira cargo e e-mail. Senhas nunca são exibidas; as ações permitem editar ou remover contas."),
        ],
      },
      {
        id: "settings-stock",
        title: "Configurações · Estoque",
        description: "Limite que define quando um produto fica crítico.",
        steps: [
          tourStep("/configuracoes", "tour-settings-heading", "Configurações", "Ajuste parâmetros operacionais e opções de segurança da conta."),
          tourStep("/configuracoes", "tour-settings-sections", "Seções", "Escolha entre configurações de estoque e segurança."),
          tourStep("/configuracoes", "tour-settings-stock", "Limite de estoque", "Produtos com quantidade positiva menor ou igual ao limite são considerados críticos."),
        ],
      },
      {
        id: "settings-security",
        title: "Configurações · Segurança",
        description: "Troca autenticada de senha e e-mail de acesso.",
        steps: [
          tourStep("/configuracoes", "tour-settings-password", "Alterar senha", "Confirme sua senha atual e defina uma nova senha com pelo menos seis caracteres.", "[data-tour='tour-settings-security-tab']"),
          tourStep("/configuracoes", "tour-settings-email", "Alterar e-mail", "Informe e confirme o novo e-mail; ao salvar, a sessão autenticada será renovada."),
        ],
      },
    ] : []),
  ];

  const consumedSections = new Set<string>();
  const findSection = (id: string) => sections.find(section => section.id === id);
  const groupSections = (id: string, title: string, description: string, subsectionIds: string[]): SystemTourSection => {
    const subsections = subsectionIds.map(findSection).filter((section): section is SystemTourSection => Boolean(section));
    subsectionIds.forEach(subsectionId => consumedSections.add(subsectionId));
    return {
      id,
      title,
      description,
      subsections,
      steps: subsections.flatMap(section => section.steps),
    };
  };

  const dashboard = findSection("home");
  const groupedSections: SystemTourSection[] = dashboard ? [{ ...dashboard, title: "Dashboard" }] : [];

  if (isAdmin) {
    groupedSections.push(groupSections("stock", "Estoque", "Produtos e categorias do catálogo.", ["products", "categories"]));
  }

  for (const id of ["decants", "body-splash"]) {
    const section = findSection(id);
    if (section) groupedSections.push(section);
  }

  groupedSections.push(groupSections(
    "sales",
    "Vendas",
    isAdmin ? "Registro, histórico e pedidos online." : "Registro de vendas.",
    isAdmin ? ["sale", "sales-history", "online-orders"] : ["sale"],
  ));

  if (isAdmin) {
    groupedSections.push(groupSections("people", "Gestão de Pessoas", "Clientes, fornecedores e funcionários.", ["people-clients", "people-suppliers", "people-employees"]));
    groupedSections.push(groupSections("settings", "Configurações", "Parâmetros de estoque e segurança da conta.", ["settings-stock", "settings-security"]));
  }

  return groupedSections;
}

export function getSystemTourSteps(isAdmin: boolean): SystemTourStep[] {
  return getSystemTourSections(isAdmin).flatMap(section => section.steps);
}
