# Validacao atual: 2026-10-12

Esta secao registra a verificacao atual. O relato de setembro abaixo e historico e nao substitui os resultados desta execucao.

## Resultado

Nao foi encontrado um novo bloqueio de rota ou endpoint nos carregamentos verificados. A validacao integral nao esta verde: persistem falhas de testes e dois riscos de contrato descritos abaixo.

| Verificacao | Resultado |
| --- | --- |
| Navegacao real, sessao ADMIN | Dez rotas carregaram com dados, sem falhas de requisicao da API durante o carregamento. |
| Consultas principais na API ativa | Dezoito GETs responderam 200. |
| Recibo e edicao da venda V-18 | Rastreio exibido nos dois modais; data e itens no recibo; canal neutro na edicao. |
| Backend: autenticacao, clientes e vendas | 94 testes aprovados. |
| Backend: todos os controllers de integracao | 314 testes: 312 aprovados, duas falhas, zero erros. |
| Frontend: suite completa | 856 testes: 850 aprovados, seis falhas; 121 arquivos aprovados e dois com falha. |
| Build frontend | Sucesso; 3398 modulos; aviso de bundle maior que 500 kB. |

Os 94 testes do backend estao incluidos nos 314; nao somar as duas execucoes. Os testes focados anteriores tambem estao incluidos na suite completa do frontend.

## API e interface reais

As rotas verificadas foram `/`, `/estoque/produtos`, `/estoque/categorias`, `/decants`, `/bodysplash`, `/vendas/registrar`, `/vendas/pedidos`, `/clientes`, `/configuracoes` e `/vendas/historico`.

As consultas com HTTP 200 cobrem produtos, clientes ativos, categorias, produtos por categoria, decants, Body Splash, fornecedores, funcionarios, vendas, detalhes de venda, busca de itens e os seis endpoints de dashboard consumidos pelo frontend. Os endpoints por periodo receberam datas ISO validas.

A venda `V-18` exibiu `BR202610070BR` no recibo e no modal de edicao. O recibo carregou `07/10/2026 14:45` e os itens; nenhum botao de salvar foi acionado.

`GET /vendas/recentes`, `/vendas/resumo` e `/vendas/online` continuam respondendo 501. O frontend atual nao os utiliza; isso nao bloqueou as telas verificadas.

## Permissoes de funcionario

O bloqueio de consulta e cadastro de clientes foi corrigido no backend. Os testes de integracao passaram para FUNCIONARIO selecionando cliente, cadastrando pelo PDV e registrando uma venda. Tambem verificam restricao das operacoes administrativas e isolamento entre organizacoes.

Essa verificacao usa Spring Security em ambiente de teste, nao um login real de funcionario na API ativa. A navegacao real foi executada apenas com ADMIN.

## Falhas encontradas

### Backend: dois testes de estoque critico

Em `DashboardControllerIntegrationTest`, os testes `deveRetornarKpisConsolidadosSemPeriodo` e `deveFiltrarPorDatasInclusivasEmFormatoIso` esperam 21 produtos criticos e recebem 22.

O helper `quantidadeProdutosCriticos()` consulta `estoqueAtual < limite` e nao filtra status. O servico usa produtos ativos com `estoqueAtual <= limite`, consistente com o alerta da interface sobre produtos no limite ou abaixo. Alinhar a consulta esperada do teste com essa regra; nao alterar o calculo apenas para satisfazer a expectativa antiga. Nenhum codigo do backend foi modificado nesta validacao.

### Frontend: seis testes de catalogo e arquitetura

- Quatro falhas em `src/app/pages/catalog-pages.test.tsx`: as paginas de catalogo usam `useApp`, mas os testes as renderizam sem `AppProvider` ou mock do contexto. Erro: `useApp must be used inside AppProvider`.
- Duas falhas em `src/test/feature-boundaries.test.ts`: `DecantsPage` e `BodySplashPage` acessam `useApp` na entrada, contrariando a regra de composicao exigida pelo teste. A leitura de permissao deve ser organizada conforme o contrato de arquitetura, preservando a restricao de gerenciamento para ADMIN.

Decants e Body Splash carregaram normalmente no navegador dentro do provider real. Essas falhas impedem declarar a suite aprovada, mas nao comprovaram um bloqueio de endpoint na aplicacao aberta. Nenhum teste ou codigo de producao foi alterado aqui.

## Riscos restantes

- As alteracoes de senha/e-mail ainda usam 401 para senha atual incorreta e sessao invalida. O frontend preserva a sessao nesses endpoints e pode mostrar a mensagem de senha incorreta em uma expiracao real.
- DELETE de rastreio e PATCH de status continuam separados: uma falha no segundo passo pode deixar a venda no status anterior e sem rastreio. O fluxo normal e a ordem das requisicoes passaram nos testes, mas isso nao fornece atomicidade.

## Comandos e limites

- Backend focado: `mvn -Dtest=ClientesControllerIntegrationTest,AuthControllerIntegrationTest,*Venda*IntegrationTest "-Dspring.datasource.url=jdbc:h2:mem:validation;MODE=MySQL;DB_CLOSE_DELAY=-1" test`.
- Backend ampliado: `mvn -Dtest=*ControllerIntegrationTest "-Dspring.datasource.url=jdbc:h2:mem:validation;MODE=MySQL;DB_CLOSE_DELAY=-1" test`.
- Frontend: `npm test -- --maxWorkers=3 --reporter=dot` e `npm run build`.
- Os testes do backend usaram H2 em memoria, separado do banco da aplicacao. Nenhum cadastro, cancelamento, edicao ou exclusao real foi executado; as escritas ocorreram apenas no ambiente de teste.
- Esta validacao confirma carregamento/leitura no ambiente atual e cenarios automatizados, nao todos os cenarios de persistencia em producao. A suite completa de services/unitarios do backend e um typecheck separado nao foram executados nesta rodada.
- Apenas este relatorio foi atualizado. A ausencia do documento anterior de ajustes foi preservada.

---

# QA independente: revalidacao final focada Peract

## Verificacao final pelo implementador

Apos o encerramento da revalidacao independente abaixo e a limpeza dos imports:

- `npm test -- --reporter=dot --maxWorkers=4`: 76 arquivos e 389 testes aprovados, zero falhas, 127.53s.
- `npm run build`: sucesso, 2388 modulos transformados, 28.79s.
- Os testes focados de produto/categoria tambem passaram: 6 testes em 2 arquivos.
- Esta execucao atualiza o estado final da suite/build; o relato independente abaixo preserva o que o QA executou em cada rodada.
- Typecheck dedicado e persistencia real no backend continuam nao verificados.

Data: 2026-09-22. Branch verificada: `feat/design-system`.
Servidor existente: http://127.0.0.1:5174/. Esta revalidacao substitui o FAIL da segunda rodada exclusivamente quanto ao retorno de foco apos Escape.

## Veredito

**PASS no escopo dos 4 defeitos: pendencia de foco encerrada.** Novo produto e Nova categoria passaram em desktop e mobile: campo com autofocus ao abrir, dialogo fechado por Escape e foco restaurado ao mesmo acionador. Selects, erros de salvamento/retry e acesso a Funcionarios mantem os resultados aprovados da rodada anterior, sem repeticao nesta revalidacao.

A suite completa anterior permanece registrada com 389 testes; nao foi repetida apos a ultima correcao. Os 5 testes focados do modal apos a correcao foram informados como GREEN pelo solicitante, com RED anterior no teste ampliado. Apenas este relatorio foi editado nesta revalidacao. Nenhuma implementacao, teste, branch ou commit foi alterado/criado.

## Comandos e contagens

| Verificacao | Resultado | Exit code |
| --- | --- | --- |
| `npm test -- --reporter=dot` (rodada anterior) | **389 passed, 0 failed; 76 arquivos; 88.36s**; nao repetido | 0 |
| Probe anterior em memoria via `node --input-type=module` / Playwright / Edge | Historico: 14 checks agrupados, 10 passed e 4 failed por foco; falhas revalidadas abaixo | 1 |
| `npm test -- src/shared/components/peract-modal/PeractModal.test.tsx --reporter=dot` (apos ultima correcao) | **5 passed**, conforme execucao informada pelo solicitante; nao repetido nesta revalidacao | 0 (informado) |
| Probe final em memoria via `node --input-type=module` / Playwright / Edge | **4 checks de foco: 4 passed, 0 failed** | 0 |
| `npm run build` | Nao repetido: nenhuma implementacao editada; sucesso das correcoes informado pelo solicitante | N/A |

Na suite anterior, nao foi necessario limitar `maxWorkers=4`: ela terminou sem travamento. Nenhuma rejeicao nao tratada foi reportada pelo Vitest. Os 6 testes dos dois formularios e os 5 do modal estao incluidos nos 389. A execucao focada dos 5 apos a ultima correcao nao e somada a esse total: nao sao 394 testes distintos.

Dos 389 testes, **243 sao contratos de identidade de exports**, conforme classificacao da primeira rodada. Eles nao comprovam interacao, CSS ou acessibilidade. Os 146 restantes nao foram reclassificados nem representam garantia de cobertura comportamental integral. Nenhum inventario amplo foi reaberto.

## Matriz de revalidacao

Edge headless 153.0.4234.48, Node 24.19.0. Contextos isolados: desktop 1440x1000; mobile emulado 390x844 com toque. Rodada anterior: `/estoque/produtos`, `/estoque/categorias` e `/clientes`. Revalidacao final: somente as duas rotas de estoque, sem navegacao nas 9 rotas.

As linhas de foco sao resultados novos; as demais preservam evidencias da rodada anterior.

| Check agrupado | Desktop | Mobile |
| --- | --- | --- |
| Categoria: popup, clique e teclado | PASS | PASS |
| Tipo de medida: popup, clique e teclado | PASS | PASS |
| Produto: HTTP 500 e retry simulado | PASS | PASS |
| Categoria: HTTP 500 e retry simulado | PASS | PASS |
| Escape devolve foco a Novo produto | PASS: mesmo BUTTON | PASS: mesmo BUTTON |
| Escape devolve foco a Nova categoria | PASS: mesmo BUTTON | PASS: mesmo BUTTON |
| Funcionarios: visualizar e ativar aba | PASS | PASS |

### Evidencias anteriores preservadas (nao repetidas)

- **Selects:** listbox e wrapper de posicionamento com `z-index: 60` nos quatro casos. `elementFromPoint` atingiu a opcao/descendente, sem intercepcao pelo modal; bounding boxes ficaram dentro do viewport. Categoria selecionada por clique: Perfumes; por teclado: Kits. Unidade por clique: un; por teclado: ml. A navegacao por Home/Enter aguardou foco real da opcao antes de confirmar.
- **Pintura dos popups:** capturas PNG recortadas em memoria diferiram entre menu exibido e oculto, e entre oculto e restaurado. Nao se afirmou igualdade visual pixel a pixel: duas capturas visiveis nao foram binariamente identicas. A aprovacao combina camada computada, contraprova de pintura, hit-testing e valor selecionado, nao apenas `isVisible()`.
- **HTTP 500:** em ambos os formularios e tamanhos, exatamente um alerta acessivel dentro do dialogo: "Nao foi possivel salvar o produto/a categoria" (texto da interface com acentos). Dialogo permaneceu aberto, nome preservado e Salvar habilitado para retry.
- **Retry:** alerta removido durante a nova tentativa; botao Salvando desabilitado enquanto o mock reteve a resposta. POST repetiu o mesmo payload; HTTP 201 simulado concluiu o fluxo e fechou o dialogo. **Zero pageerrors**, incluindo rejeicoes nao tratadas observaveis pelo navegador.
- **Funcionarios:** desktop sem necessidade de rolagem. Mobile: container com `overflow-x: auto`, largura 358px, conteudo 464px; swipe real via eventos de toque rolou 106px. Aba e contador acessiveis, clique/toque ativou a busca de funcionario, sem overflow horizontal do documento. Borda direita da aba em 374.3125px para container em 374px: tolerancia geometrica de 1px para arredondamento, sem perda de label/contador.

## Pendencia encerrada

### P2: retorno de foco apos Escape - PASS

- Correcao do solicitante conferida em [PeractModal.tsx](src/shared/components/peract-modal/PeractModal.tsx): captura inicial de `document.activeElement` no `useRef`; `onOpenAutoFocus` nao substitui a referencia por elemento dentro de `[role="dialog"]`.
- Teste ampliado conferido em [PeractModal.test.tsx](src/shared/components/peract-modal/PeractModal.test.tsx): `PeractInputControl autoFocus`, assert de foco no campo e retorno ao acionador depois de Escape. RED antes / GREEN agora e 5 testes aprovados conforme informado pelo solicitante.
- Probe de navegador final: abertura por clique no desktop e `tap` no mobile; assert de `document.activeElement` igual ao campo Nome; Escape; espera pelo fechamento; assert de igualdade exata com o elemento original do acionador, ainda conectado. Timeout de 3 segundos para os asserts de foco, sem reposicionar foco artificialmente.

| Formulario | Viewport | Foco ao abrir | Apos Escape | Resultado |
| --- | --- | --- | --- | --- |
| Novo produto | 1440x1000 | INPUT, `focused: true` | BUTTON "Novo produto", `sameTrigger: true` | PASS |
| Nova categoria | 1440x1000 | INPUT, `focused: true` | BUTTON "Nova Categoria", `sameTrigger: true` | PASS |
| Novo produto | 390x844, toque | INPUT, `focused: true` | BUTTON "Novo produto", `sameTrigger: true` | PASS |
| Nova categoria | 390x844, toque | INPUT, `focused: true` | BUTTON "Nova Categoria", `sameTrigger: true` | PASS |

Nos quatro casos, `dialogClosed: true` e `connected: true`. Probe final: exit code 0, zero `pageerrors`, zero tentativas de escrita e zero writes reais no backend.

## Cenarios BDD revalidados

O cenario de retorno de foco foi revalidado nesta execucao final; os demais pertencem a rodada anterior.

```gherkin
Feature: Regressao focada dos formularios e navegacao Peract

Scenario: Selecionar categoria e unidade dentro do cadastro
  Given que o usuario abriu o cadastro de produto
  When abrir as listas de categoria e unidade de medida
  Then as opcoes devem aparecer acima do formulario
  And devem aceitar selecao por clique e teclado

Scenario: Tentar salvar novamente depois de uma falha
  Given que o usuario preencheu um cadastro valido
  When o salvamento falhar
  Then o dialogo deve informar a falha e preservar os dados
  When tentar novamente e o servico responder com sucesso
  Then o erro anterior deve desaparecer e o fluxo deve concluir

Scenario: Retomar o foco depois de fechar o cadastro
  Given que o usuario abriu um cadastro pelo botao da pagina
  When pressionar Escape
  Then o dialogo deve fechar
  And o foco deve voltar ao botao que abriu o cadastro

Scenario: Acessar Funcionarios em uma tela estreita
  Given que um administrador acessa Gestao de Pessoas em mobile
  When deslizar horizontalmente o grupo de abas
  Then deve conseguir visualizar Funcionarios e seu contador
  And deve conseguir ativar a aba por toque
```

## Limites e seguranca da revalidacao final

- `tool_search` indisponivel: nao foi possivel carregar as ferramentas do browser `a09a1023-eae4-469e-aa43-2226d557cbf1`. Sua sessao e mocks nao foram alterados. Playwright existente na extensao do VS Code foi reutilizado, sem instalacao, em contextos efemeros Edge fechados ao final.
- Sessao ficticia de Administrador e service workers bloqueados. Mocks de leitura recriados somente nesses contextos: 4 GETs de categorias com array e 2 GETs de produtos com pagina vazia. Somente recursos GET/HEAD do servidor Vite puderam seguir para a rede; qualquer escrita foi bloqueada antes do envio.
- Nenhum formulario submetido. `blockedWrites: []`, `realBackendWrites: 0`, `pageErrors: []`. Oito recursos externos bloqueados (fontes e VLibras); nao declarar console inteiramente limpo.
- Sem suite completa, build, typecheck, nove rotas, instalacoes ou novos artefatos. Somente este relatorio editado; alteracoes preexistentes preservadas; sem commits.
- Validacao limitada ao foco nos quatro casos com APIs simuladas. Sem dispositivo fisico, outros motores, persistencia real, callbacks customizados de autofocus ou acionador removido. Os demais PASS sao evidencias anteriores, nao nova verificacao de toda a migracao.

## Historico de execucao da segunda rodada

As observacoes abaixo documentam a rodada anterior, antes da ultima correcao; nao descrevem o probe final de foco.

- `tool_search` nao estava disponivel; as ferramentas integradas de navegador nao foram chamadas sem carregamento. Playwright existente na extensao do VS Code foi reutilizado via terminal, sem instalacao. O pageId compartilhado e suas interceptacoes/sessao nao foram manipulados.
- Sessao ficticia com `cargo: "Administrador"` apenas em contextos efemeros, fechados ao final. Service workers bloqueados. Somente GETs de recursos do Vite seguiram para a rede; APIs foram respondidas por mock e demais recursos bloqueados. **Nenhum write chegou ao backend**, inclusive nas tentativas intermediarias.
- Na execucao final: 8 POSTs interceptados, sendo 4 respostas 500 e 4 respostas 201; nenhum write inesperado. GETs de categorias retornaram array e produtos pagina vazia. Sucesso/retry verifica UI, nao persistencia real.
- Console da execucao final: 4 erros de recurso HTTP 500 esperados e 12 `net::ERR_FAILED` por bloqueio de recursos; zero `pageerrors`. Nao declarar console inteiramente limpo.
- Probes intermediarios foram corrigidos: distinguir documentos de fetch/XHR; localizar listbox oculto na contraprova; sincronizar teclado pelo foco; usar cargo correto na sessao; aguardar swipe e tolerar arredondamento subpixel. Esses erros de instrumentacao nao foram contados como defeitos do produto. A falha de foco persistiu no probe final.
- Capturas e scripts desta rodada ficaram em memoria; nenhum novo arquivo de teste, screenshot ou outro artefato foi criado no workspace. Logs automaticos das ferramentas ficam fora do repositorio.
- Sem revisao visual humana de screenshots nesta rodada; sem fontes remotas, dispositivo fisico, outros motores de navegador, autenticacao/persistencia reais, callbacks customizados de autofocus ou acionador removido. Sem novo build ou typecheck. Nao extrapolar a aprovacao dos tres itens para toda a migracao.
- A unica edicao desta rodada foi [runtime-validation-report.md](runtime-validation-report.md). Alteracoes preexistentes preservadas; sem commits.

```text
environment: Node AVAILABLE; Edge/Playwright AVAILABLE; Docker NOT_ASSESSED (fora do escopo)
startup: PASS - exit_code: 0 no probe inicial corrigido; Vite existente; formulario carregado
full-suite: PREVIOUS_PASS - exit_code: 0; files: 76; passed: 389; failed: 0; NOT_RERUN
exports-contracts: 243 included in 389; NOT behavioral coverage
focused-modal-tests: REPORTED_PASS after latest fix; passed: 5; exit_code: 0 reported; not added to 389
previous-browser: 14 grouped_checks; passed: 10; failed: 4 (focus, now resolved)
final-focus-browser: PASS - exit_code: 0; checks: 4; passed: 4; failed: 0
pageerrors: 0 in final focus probe
backend-writes: 0; attempted-writes: 0
build: NOT_RERUN - exit_code: N/A; nenhuma implementacao editada
backend-integration: UNVERIFIED - exit_code: N/A; somente mocks
overall: PASS for the 4 reported defects; final focus validation + preserved previous evidence; not a full migration sign-off
```