# Dashboard: integração frontend/backend

A rota `/` carrega `src/features/home`. Essa tela consome os endpoints administrativos do backend e faz as requisições somente para usuários com perfil `Administrador`.

## Contratos consumidos

Todas as chamadas usam `apiClient`, que envia o JWT da sessão. As rotas de dashboard exigem autenticação e perfil `ADMIN`; a API responde `401` sem autenticação e `403` para funcionário.

| Endpoint | Uso na tela |
| --- | --- |
| `GET /dashboard/kpis?dataInicio&dataFim` | Total e comparação de vendas, faturamento, margem, clientes ativos e total de produtos críticos. |
| `GET /dashboard/vendas-por-canal?dataInicio&dataFim` | Contagens de vendas finalizadas por Presencial, WhatsApp e Site para a KPI Vendas por canal. |
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
- A KPI Vendas por canal substitui Ticket Médio e considera apenas vendas finalizadas no período, da organização autenticada.
- Faturamento, distribuição e margem consideram somente vendas finalizadas.
- Descontos são rateados pelos itens; frete não compõe receita nem margem.
- Margem usa custo histórico gravado nos itens, não o custo atual do catálogo.
- Clientes cadastrados no KPI são clientes ativos da organização, independentes do período.
- A lista de estoque mostra até quatro itens, mas o alerta usa o total de `produtosCriticos` do KPI.
- Vendas recentes expõem `dataHoraVenda`. A interface mostra a data e a hora retornadas pela API, sem inventar horário de compra.
- Funcionários não disparam chamadas administrativas e recebem apenas atalhos operacionais na Home.

## Vendas por canal

O endpoint retorna `{ presencial: number, whatsapp: number, site: number }`, calculado em uma única agregação no banco, sem limite de vendas recentes e sem carregar todas as vendas no frontend. O período usa início inclusivo e término exclusivo no primeiro instante do dia seguinte à data final.

O seletor do card oferece Todos os canais, Presencial, WhatsApp e Site. Todos os canais soma as três contagens. Trocar o canal não repete chamadas; trocar o período ou aplicar um intervalo personalizado recarrega a agregação e preserva o canal selecionado.

A KPI também exibe a variação percentual contra o intervalo imediatamente anterior, com a mesma quantidade de dias inclusivos. O frontend consulta o endpoint existente duas vezes em paralelo: período atual e anterior. A comparação usa o mesmo canal em ambos; Todos os canais compara as somas, nunca a média das variações. A fórmula é `(atual - anterior) / anterior * 100`. Seguindo a convenção dos demais KPIs, anterior zero produz 0% quando atual também é zero e +100% quando atual é positivo.

Carregamento e erro dessa KPI são independentes dos outros indicadores. Uma resposta válida sem vendas exibe zero; falha ou resposta inválida exibe indisponibilidade e permite tentar novamente, sem apresentar um zero falso. Respostas atrasadas do período anterior são descartadas.

Se apenas a consulta do intervalo anterior falhar, a contagem atual permanece visível com a mensagem de comparação indisponível, sem percentual inventado. Os cards mantêm a altura padronizada e a descrição de vendas finalizadas junto ao indicador de variação.

É necessário reiniciar/publicar o backend atualizado para disponibilizar `/dashboard/vendas-por-canal`. Nenhuma migração de banco é necessária. O contrato anterior de `/dashboard/kpis`, incluindo `ticketMedio`, permanece compatível; apenas sua exibição foi substituída na Home.

## Backend e migração

O backend informa que os vínculos de organização, `dataHoraVenda` e snapshots de custo estão no schema de desenvolvimento. Para bancos existentes, a migração `docs/migracao-dashboard-organizacao-custos.sql` é manual: revisar e preencher o mapeamento de clientes/vendas, verificar organização dos itens e validar snapshots de custo antes de tornar colunas obrigatórias. O custo atribuído a vendas legadas é uma aproximação baseada no catálogo atual; recomenda-se backup e homologação.

O relatório do backend registra aprovação dos testes focados da dashboard, vendas, clientes e inativação. Também registra falhas ainda abertas em suítes separadas de categorias e produtos (404 e contagem), fora do escopo da dashboard; investigar antes de considerar a validação geral do backend concluída.

## Validação frontend

Testes focados da feature: `npm test -- src/features/home`. Eles cobrem limites de data, agrupamento por período, mapeamento dos DTOs, falhas parciais, KPIs e restrição das chamadas por perfil. O build pode ser validado com `npm run build`.

Validação inicial da KPI: 52 testes da feature aprovados; suíte frontend completa com 128 arquivos/979 testes aprovados; build aprovado. No backend, 24 testes de integração da dashboard aprovados em H2, incluindo canais, período, status, organização e acesso ADMIN. Isso não confirma a publicação do novo endpoint no ambiente em execução.

Ampliação da comparação: 64 testes da feature e build aprovados, incluindo virada de mês/ano, ano bissexto, base zero, queda, crescimento, troca de canal e falha parcial. Essa ampliação reutiliza o endpoint e não altera o contrato do backend.
