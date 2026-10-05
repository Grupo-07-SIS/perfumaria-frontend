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