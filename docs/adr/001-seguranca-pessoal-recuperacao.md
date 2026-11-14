# ADR 001 — Segurança pessoal e recuperação com autorização limitada

Status: implementado no frontend; validação de integração pendente. Escopo: somente perfumaria-frontend.

## Contexto e decisão

Segurança da conta é pessoal: administradores e funcionários podem cadastrar/substituir três perguntas. Estoque e gestão de pessoas continuam administrativos, inclusive por URL. Recuperação é uma rota pública real, não depende da sessão autenticada nem reutiliza JWTs.

Aplicam-se Contract-First, DDD (contexto Segurança da Conta), SOLID/arquitetura em camadas, Specification by Example/BDD, e migração incremental Strangler Fig com feature flag. Os testes foram escritos para os contratos e exemplos antes/com a implementação; não se afirma execução do ciclo Red/Green, pois a descoberta de testes do editor não encontrou testes. Não foi usada arquitetura hexagonal.

- Repositories conhecem HTTP e DTOs; mappers convertem contratos; services validam; facades coordenam estado; componentes usam RHF e Peract.
- Somente perguntas recebem trim. Respostas e senhas permanecem exatas, sem trim, conversão de caixa, remoção de acentos ou normalização Unicode.
- Capability tokens de recuperação permanecem na memória do fluxo. Não são enviados em URL, persistidos, registrados ou tratados como sessão normal. Voltar/cancelar reinicia o fluxo e descarta estado; expiração e sucesso também removem tokens. Respostas são removidas ao trocar para a etapa de senha. Requisições antigas não podem restaurar fluxo cancelado.
- PUT exige senha atual, inclusive no cadastro inicial, e token CSRF materializado por GET separado; nome do header é definido pelo servidor.
- Estado transversal de status fica em core, sem importar eager a feature de configurações. Respostas de status antigas são ignoradas após logout/novo login/troca de usuário. Erros de rede não bloqueiam login nem presumem ausência de perguntas; 401 de endpoints autenticados invalida a sessão.
- Aviso abaixo do header e fora do main rolável só fecha pelo X. CTA/navegação/Escape/clique fora não o fecham. Após 204, texto é atualizado mas permanece visível. A preferência inclui usuário, identificador aleatório não autenticante da sessão, dismissed e shown. `shown` evita fechamento involuntário após reload com cadastro completo. Não se armazena JWT, senha, resposta ou capability nesse registro. Novo login reinicia preferência; logout/invalidação limpa.
- Blocos legados de troca de senha/email foram mantidos explicitamente desativados: eram simulações locais, não integrações reais. Não foi criada integração fictícia.

## Consequências e riscos residuais

O fluxo expõe existência da conta/perguntas e não confirma propriedade do email. Email identifica a conta, não autentica. Perguntas de baixa entropia não substituem MFA. A UI não elimina enumeração nem implementa bypass administrativo; conta sem três perguntas deve procurar administrador.

Rate limit e expiração são autoritativos no backend. A janela de falhas de oito horas não é implementada ou zerada no navegador; a UI mostra o Retry-After recebido, inclusive HTTP-date. Flag frontend apenas controla rollout/visibilidade, não é uma autorização de segurança.

TLS, hashes irreversíveis, consumo/revogação de tokens e JWTs, rate limit persistente e permissões servidor são responsabilidades backend/SQL e não foram alterados nesta entrega.