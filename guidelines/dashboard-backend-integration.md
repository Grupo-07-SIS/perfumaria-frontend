# Dashboard: integração frontend/backend

A rota `/` carrega `src/features/home`. Essa tela consome os endpoints administrativos do backend e faz as requisições somente para usuários com perfil `Administrador`.

## Contratos consumidos

Todas as chamadas usam `apiClient`, que envia o JWT da sessão. As rotas de dashboard exigem autenticação e perfil `ADMIN`; a API responde `401` sem autenticação e `403` para funcionário.

| Endpoint | Uso na tela |
| --- | --- |
| `GET /dashboard/kpis?dataInicio&dataFim` | Total e comparação de vendas, faturamento, margem, clientes ativos e total de produtos críticos. |
| `GET /dashboard/vendas-recentes` | Lista de até seis vendas; data, cliente, valor, forma de pagamento e status. |
| `GET /dashboard/estoque-critico` | Lista dos quatro produtos mais críticos. |
| `GET /dashboard/top-produtos?dataInicio&dataFim` | Top cinco produtos no período. |
| `GET /dashboard/distribuicao-categorias?dataInicio&dataFim` | Receita líquida por categoria. |
| `GET /dashboard/series-temporais?dataInicio&dataFim&agrupamento` | Buckets para os gráficos de faturamento e volume de vendas. |

A série temporal responde `{ periodos: [{ inicio, rotulo, vendas, faturamento }] }`. O frontend mapeia `rotulo` para o eixo horizontal, `faturamento` para o gráfico monetário e `vendas` para o gráfico de quantidade.

Agrupamentos enviados conforme o período:

- `diario`: `HORA`
- `7dias` e `30dias`: `DIA`
- `semestre`: `MES`

Os limites de data são calculados no fuso de negócio `America/Sao_Paulo` e enviados como datas ISO inclusivas. Períodos sem movimento devem vir da API como buckets zerados. Se o endpoint falhar, cada seção preserva seu estado independente e os gráficos exibem indisponibilidade; ausência de vendas não é tratada como erro.

## Regras de negócio refletidas

- KPI de vendas inclui pendentes e finalizadas; exclui canceladas.
- Faturamento, distribuição e margem consideram somente vendas finalizadas.
- Descontos são rateados pelos itens; frete não compõe receita nem margem.
- Margem usa custo histórico gravado nos itens, não o custo atual do catálogo.
- Clientes cadastrados no KPI são clientes ativos da organização, independentes do período.
- A lista de estoque mostra até quatro itens, mas o alerta usa o total de `produtosCriticos` do KPI.
- Vendas recentes expõem `dataHoraVenda`. A interface mostra a data e a hora retornadas pela API, sem inventar horário de compra.
- Funcionários não disparam chamadas administrativas e recebem apenas atalhos operacionais na Home.

## Backend e migração

O backend informa que os vínculos de organização, `dataHoraVenda` e snapshots de custo estão no schema de desenvolvimento. Para bancos existentes, a migração `docs/migracao-dashboard-organizacao-custos.sql` é manual: revisar e preencher o mapeamento de clientes/vendas, verificar organização dos itens e validar snapshots de custo antes de tornar colunas obrigatórias. O custo atribuído a vendas legadas é uma aproximação baseada no catálogo atual; recomenda-se backup e homologação.

O relatório do backend registra aprovação dos testes focados da dashboard, vendas, clientes e inativação. Também registra falhas ainda abertas em suítes separadas de categorias e produtos (404 e contagem), fora do escopo da dashboard; investigar antes de considerar a validação geral do backend concluída.

## Validação frontend

Testes focados da feature: `npm test -- src/features/home`. Eles cobrem limites de data, agrupamento por período, mapeamento dos DTOs, falhas parciais, KPIs e restrição das chamadas por perfil. O build pode ser validado com `npm run build`.
