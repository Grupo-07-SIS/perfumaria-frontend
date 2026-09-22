# Revisao focada da refatoracao

## Ajustes posteriores do implementador

- Suite completa final: `npm test -- --reporter=dot --maxWorkers=4`, 86 arquivos e 443 testes aceitos, 126.81s. O total inclui 1 `it.fails` para o risco herdado de fechamento atrasado; nao representa 443 comportamentos corretos.
- Build final: `npm run build`, sucesso, 2465 modulos, 22.60s. Vite nao substitui typecheck; o problema preexistente de tipos da tabela continua documentado.
- Removidos os parametros sem uso dos hooks de rastreio/edicao e a constante `DARK` sem uso; call sites atualizados.
- `selectHomeMetrics` recebe suas fontes de dados como argumentos. O service nao importa mais o repository em runtime; o import restante e apenas de tipos.
- Os testes focados de Home/pedidos/historico e de vendas/pedidos/historico passaram apos os respectivos ajustes (15 em cada execucao, com sobreposicao).
- A revisao abaixo preserva os achados originais do QA. Os riscos herdados do timer e do barrel da tabela nao foram alterados nesta refatoracao.

Data: 2026-09-22. Escopo: nove features extraidas e core movido; baseline `15d6dce`, HEAD `f066fbc` e alteracoes locais. Sem regressao funcional nova demonstrada neste recorte; nao equivale a aprovacao de build ou suite completa.

## Achados prioritarios

- P2, tipos na extracao: [useRastreioModalForm](../src/features/online-orders/facade/useRastreioModalForm.ts#L5) recebe argumentos inteiramente inutilizados (TS6198); [useEditModalForm](../src/features/sales-history/facade/useEditModalForm.ts#L8) recebe `onClose` inutilizado (TS6133). Contrariam `noUnusedParameters` ativo. [useNovoClienteModalForm](../src/features/sales/facade/useNovoClienteModalForm.ts#L32) tambem declara `DARK` sem uso. Nao houve correcao de implementacao.
- P2, preexistente: o [barrel da tabela](../src/shared/components/peract-table/index.ts#L2) exporta tipo e componente homonimos `PeractTableHeader` de modulos diferentes (TS2300). Gerou dez TS2693 em cinco Views. Barrel identico no baseline; testes de runtime passando nao comprovam tipos corretos.
- P2, runtime preexistente: [useClienteModalForm](../src/features/people/facade/useClienteModalForm.ts#L63) agenda fechamento mesmo depois de `onSave` desmontar o modal. Reabrir antes de 1200 ms permite que o timer anterior feche e descarte o segundo cadastro. Reproduzido com timers controlados e `it.fails`; baseline possui o mesmo fluxo. Nao corrigido por estar fora do escopo.
- P3, arquitetura: [HomeView](../src/features/home/components/HomeView.tsx#L8) importa formatadores do [service](../src/features/home/services/home.service.ts#L3) que tambem importa repository. O teste de fronteiras cobre apenas imports diretos, nao esse acoplamento transitivo. Nao ha write direto de View em repository demonstrado.
- P3, separacao incompleta: facades ainda transportam apresentacao via [createPeopleTabs](../src/features/people/facade/usePeopleFacade.ts#L1), [saleStatusConfig](../src/features/sales-history/facade/useEditModalForm.ts#L1) e [settingsSections](../src/features/settings/facade/useSettingsFacade.ts#L1). Tambem expoem setters/operacoes do repository nao consumidos pelas Views. Risco de manutencao e de contornar handlers, nao falha funcional demonstrada.

## Evidencias

- `npm test -- src/features/people/PeoplePage.test.tsx --reporter=verbose --maxWorkers=4`: 7 testes aceitos, incluindo 1 falha esperada (`it.fails`), nao um comportamento corrigido.
- `npm test -- src/test/feature-boundaries.test.ts src/features/decants/facade/useDecantsFacade.test.ts --reporter=verbose --maxWorkers=4`: 14 testes passaram.
- `npm test -- src/features/home/HomePage.test.tsx src/features/dashboard/DashboardPage.test.tsx --reporter=verbose --maxWorkers=4`: 8 testes passaram.
- Total desta revisao: 29 testes aceitos, sendo 28 convencionais e 1 falha esperada. Quatro testes adicionados em tres arquivos existentes; nomes anteriores preservados. Os 44 testes informados pelo usuario nao foram reexecutados integralmente.
- Seis modulos movidos (AppContext e cinco Botpress) identicos ao baseline apos normalizar somente imports relativos do core. Novo teste confirma identidade dos exports de runtime entre adaptadores `app` e `core`, sem disparar mensagens ou HTTP. Isso nao verifica exports apagados de tipos.
- Analise sem emissao com TypeScript 6.0.3 embarcado no VS Code: 111 arquivos-raiz do recorte; 18 diagnosticos locais (10 usos do header como valor e 8 de declaracoes/imports inutilizados). Nenhum export ausente ou caminho nao resolvido encontrado nesse recorte. Cinco avisos de import inutilizado tambem decorrem do header; os outros tres estao listados acima.
- RHF: cancelar/reabrir cliente restaura valores persistidos; editar e salvar funciona. Exclusao de Decants ignora alvo ausente, respeita cancelamento e remove apenas o alvo confirmado. Entradas permanecem composicao; rotas existentes seguem lazy. Dashboard nao tem rota propria no estado atual.

## Cenarios acrescentados

```gherkin
Feature: Preservacao de comportamento apos extracao
  Scenario: Cancelar uma edicao de cliente
    Given que um cliente tem dados salvos
    When alterar seu nome, cancelar e reabrir a edicao
    Then os dados salvos devem ser restaurados

  Scenario: Abrir outro cadastro logo apos salvar
    Given que um cadastro acabou de ser salvo
    When iniciar outro cadastro antes do fechamento atrasado
    Then o novo cadastro deve permanecer aberto com seu rascunho
```

O segundo cenario falha atualmente e esta registrado como falha esperada. Os testes adicionais de exclusao e identidade dos adaptadores cobrem comportamento da facade e compatibilidade de integracao, respectivamente.

## Limitacoes

Sem suite completa, build, instalacoes, browser ou writes reais. Compilador do editor, nao dependencia fixada pelo projeto; analise com `types: []` porque `@types/node` local esta ausente, excluindo testes e filtrando diagnosticos por escopo. Nao substitui o gate TypeScript do projeto. Fluxos assicronos Botpress pendentes e todas as combinacoes de formularios nao foram exercitados. Nenhuma alteracao em implementacao, PeractCheckbox, scripts, README, relatorio antigo ou commits.