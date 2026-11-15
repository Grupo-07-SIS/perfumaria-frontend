# Validação do merge frontend — 2026-11-14

Merge existente de `origin/main`, sem iniciar outro merge. Backend e SQL não foram alterados nesta continuação. Nenhum teste foi removido, nenhum threshold foi reduzido e os formulários reais de senha/e-mail foram preservados. Tour, layout, interceptadores Axios, configuração de produção e segurança da conta permanecem integrados.

## Correções

- Mocks de sessão completos (incluindo `clear` e `subscribeToClear`); status de segurança isolado nos testes de outras features, sem chamadas reais incidentais.
- Teste do intervalo personalizado com relógio fixo, independente do mês da execução.
- Facade das perguntas usa o contexto canônico de `core/store`; entrada SettingsPage permanece composição de facade + view, sem reintroduzir formulários simulados.
- Barrel da tabela preserva `PeractTableHeader<TData>` como tipo e `PeractTableHeader` como componente, sem export duplicado.
- Opções `exact` inválidas em consultas por role corrigidas nos pontos já tratados durante a resolução.

## Resultados

- `npm test`: 139 arquivos, 1.044 testes aprovados, sem unhandled errors.
- `npm run build`: aprovado; aviso não bloqueante de chunk HomePage maior que 500 kB.
- `npm run test:coverage`: aprovado; statements/lines 94,17%, branches 85,50%, functions 91,95%. Thresholds globais de 80% inalterados.
- `npx tsc --noEmit`: **reprovado**, saída 2; **56 diagnósticos em 20 arquivos**. Build Vite não substitui typecheck.
- Avisos não bloqueantes nos testes: dimensão zero do Recharts em jsdom, atualizações fora de `act` e CORS numa consulta do teste legado de catálogo.

## Dívida TypeScript restante — lista completa por arquivo

Locais abaixo usam linha:coluna, códigos e causa. Não representam falhas dos testes runtime.

| Arquivo (relativo a src/) | Locais e causa |
| --- | --- |
| core/layout/systemTour.test.ts | 32:63 — TS2339: `startsWith` em `string \| HTMLElement` |
| features/body-splash/components/BodySplashModal.tsx | 32:30 — TS2345: argumento sem `productOptions` |
| features/body-splash/facade/useBodySplashModalForm.ts | 7:3 — TS6133: `onClose` não utilizado |
| features/decants/components/DecantModal.tsx | 32:26 — TS2345: argumento sem `perfumeOptions` |
| features/decants/facade/useDecantModalForm.ts | 7:3 — TS6133: `onClose` não utilizado |
| features/home/components/HomeView.tsx | 75:3 — TS6133: `margemPercReal` não utilizado; 218:33, 218:36, 254:39, 254:46, 295:52, 295:58 — TS7006: parâmetros implicitamente any |
| features/home/facade/useHomeFacade.ts | 4:36 — TS2459: `DashboardData` não exportado; 21:10 — TS6133: `customerCount` não utilizado; 123:25, 136:25 — TS2345: `string[]` incompatível com `DashboardSection[]` |
| features/online-orders/OnlineOrdersPage.test.tsx | 47:16 — TS2322: undefined incompatível com string; 224:70, 237:72, 252:72, 283:72, 291:72 — TS2769: `exact` não existe em ByRoleOptions |
| features/people/PeoplePage.test.tsx | 191:47, 282:65, 293:113, 696:84, 710:83, 713:83 — TS2769: `exact` não existe em ByRoleOptions |
| features/people/components/FornecedorModal.tsx | 90:18 — TS2322: `inputMode` string incompatível com união nativa |
| features/people/components/PeopleView.tsx | 49:3 — TS6133: `filtFuncionarios` não utilizado |
| features/people/facade/useFuncionarioModalForm.ts | 8:3 — TS6133: `onClose` não utilizado; 69:9 — TS2322: string opcional incompatível com string |
| features/people/facade/usePeopleFacade.test.ts | 341:44 — TS2345: fixture sem `senha` |
| features/products/facade/useProductsFacade.test.tsx | 159:40, 206:48 — TS2345: fixtures sem `categoriaNome` |
| features/products/repository/products.repository.test.ts | 84:59, 94:62, 111:81, 112:84 — TS2345: fixtures sem `tipoProduto` |
| features/products/services/products.service.test.ts | 101:32 — TS2345: fixture sem `categoriaNome` |
| features/sales-history/SalesHistoryPage.test.tsx | 150:61, 152:70, 157:70, 166:70, 221:69, 223:71, 254:71, 260:70, 274:71, 289:69 — TS2769: `exact` não existe em ByRoleOptions |
| features/sales/SalesPage.integration.test.tsx | 407:69, 414:69, 418:69 — TS2769: `exact` não existe em ByRoleOptions |
| features/sales/components/SalesView.tsx | 68:3 — TS6133: `addToCart` não utilizado |
| shared/components/peract-collapsible/PeractCollapsible.tsx | 11:53, 16:53 — TS2551: nomes de tipos Radix incorretos (`PeractCollapsibleTrigger`, `PeractCollapsibleContent`) |

Totais por código: TS2769=24, TS2345=12, TS6133=7, TS7006=6, TS2322=3, TS2551=2, TS2339=1, TS2459=1. Não há diagnóstico restante no barrel de tabela nem nas features settings/password-recovery/login.

Logs completos da última rodada estão em /tmp, prefixo perfumaria-frontend-merge; o relatório versionado mantém os bloqueadores mesmo sem esses arquivos temporários. Typecheck permanece pendente de uma correção dedicada da dívida ampla das features remotas, conforme escopo autorizado.