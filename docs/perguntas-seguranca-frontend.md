# Implementação frontend — perguntas de segurança e recuperação

Documento do módulo frontend da entrega integrada com SQL/backend. Nenhum commit realizado.

## Rotas e rollout

- `/login`: lazy, público sem sessão; com sessão válida redireciona para `/`.
- `/recuperar-senha`: lazy, público, funciona por URL direta; flag desligada redireciona para login.
- `/configuracoes?secao=seguranca`: lazy, protegido, segurança pessoal de ambos os perfis.
- URLs protegidas anteriores preservadas: `/`, `/estoque/produtos`, `/estoque/categorias`, `/decants`, `/bodysplash`, `/vendas/registrar`, `/vendas/historico`, `/vendas/pedidos`, `/clientes`, `/configuracoes`. Estoque e clientes têm guard administrativo; funcionário não consegue abrir seção de estoque nas configurações.
- `VITE_SECURITY_QUESTIONS_ENABLED=false` desliga link, banner, formulário e acesso à recuperação. Ausência da variável ou valor diferente de `false` mantém default true. É uma variável Vite de build; reiniciar/rebuildar para mudar. Backend/migration devem estar prontos antes do rollout.
- LoginFormPanel usa Link dentro do Router e anchor acessível fora dele, preservando testes isolados.

## Contrato HTTP exato

Base: `environment.backendUrl`, configurável por `VITE_BACKEND_URL`, padrão http://localhost:8080. Na validação isolada foi usado http://localhost:8081, sem alterar o serviço existente na porta 8080.

| Método e caminho | Envio | Resposta |
|---|---|---|
| GET `/usuarios/me/perguntas-seguranca/status` | credentials include | `{quantidade:number,completo:boolean}` |
| GET `/usuarios/me/perguntas-seguranca` | credentials include | **array** `[{ordem,pergunta}]`, id opcional; nunca respostas |
| GET `/auth/csrf` | credentials include | `{token,headerName}` |
| PUT `/usuarios/me/perguntas-seguranca` | credentials include, JSON `{senhaAtual,perguntas:[{ordem,pergunta,resposta}]}`, header `[headerName]:token` | 204 |
| POST `/auth/recuperacao-senha/iniciar` | credentials omit, JSON `{email}` | `{tokenDesafio,expiraEm,perguntas:[{ordem,pergunta}]}` |
| POST `/auth/recuperacao-senha/verificar` | credentials omit, header `X-Recuperacao-Token: tokenDesafio`, JSON `{respostas:[{ordem,resposta}]}` | `{tokenRedefinicao,expiraEm}` |
| POST `/auth/recuperacao-senha/redefinir` | credentials omit, header `X-Recuperacao-Token: tokenRedefinicao`, JSON `{novaSenha,confirmacao}` | 204; **sem login automático** |

`expiraEm` deve ser ISO UTC com sufixo Z. Todos os fetches usam cache no-store. Erros leem `message` ou `mensagem`; 429 conserva e exibe Retry-After (segundos ou HTTP-date). Nenhum bearer token/interceptor de autenticação é aplicado à recuperação. Nenhum segredo é enviado em URL ou guardado em storage.

### Validação

- Exatamente ordens 1, 2 e 3 no envio de cadastro/verificação.
- Perguntas: trim antes de validar/enviar/salvar, 1–255 caracteres e três textos diferentes comparados somente após trim. Lista parcialmente cadastrada (0–3 ordens únicas válidas) pode ser pré-carregada para completar/substituir.
- Respostas: não brancas, 1–1024 bytes UTF-8. Texto original permanece exato; diferença de espaços, acentos, caixa ou sequência Unicode importa.
- Nova senha: 8–72 bytes UTF-8; confirmação idêntica, sem transformação. Senha atual obrigatória, até 72 bytes, sem impor mínimo novo às senhas já existentes. Requisitos do login existente não foram alterados.
- Pré-carga somente perguntas; senha atual e respostas sempre vazias. Após salvar, respostas/senha são limpas.

## Arquivos principais

- Bootstrap/rotas/provider: [App](../src/app/App.tsx), [rotas](../src/app/routes.ts), [AppContext](../src/app/context/AppContext.tsx), [guards](../src/core/guard/AuthGuards.tsx), [environment](../src/environment/index.ts).
- Status/aviso: [serviço status](../src/core/services/security-questions-status.service.ts), [HTTP/erros](../src/core/services/security-http.ts), [hook status](../src/core/security/useSecurityQuestionsStatus.ts), [preferência por sessão](../src/core/security/security-warning-session.ts), [banner](../src/core/layout/SecurityQuestionsWarningBanner.tsx), [layout](../src/core/layout/AppLayout.tsx), [validação](../src/core/security/security.validation.ts).
- Configurações: [SettingsPage](../src/features/settings/SettingsPage.tsx), [formulário](../src/features/settings/components/SecurityQuestionsForm.tsx), [facade](../src/features/settings/facade/useSecurityQuestionsFacade.ts), [service](../src/features/settings/services/security-questions.service.ts), [repository](../src/features/settings/repository/security-questions.repository.ts), [DTO](../src/features/settings/repository/dto/security-questions.dto.ts), [mapper](../src/features/settings/repository/mapper/security-questions.mapper.ts), [models](../src/features/settings/models/security-questions.models.ts), [config](../src/features/settings/config/security-questions.config.ts).
- Recuperação: [PasswordRecoveryPage](../src/features/password-recovery/PasswordRecoveryPage.tsx), [email](../src/features/password-recovery/components/RecoveryEmailStep.tsx), [respostas](../src/features/password-recovery/components/RecoveryAnswersStep.tsx), [senha](../src/features/password-recovery/components/RecoveryPasswordStep.tsx), [facade](../src/features/password-recovery/facade/usePasswordRecoveryFacade.ts), [service](../src/features/password-recovery/services/password-recovery.service.ts), [repository](../src/features/password-recovery/repository/password-recovery.repository.ts), [DTO](../src/features/password-recovery/repository/dto/password-recovery.dto.ts), [mapper](../src/features/password-recovery/repository/mapper/password-recovery.mapper.ts), [models](../src/features/password-recovery/models/password-recovery.models.ts), [config](../src/features/password-recovery/config/password-recovery.config.ts).
- Integração login: [LoginFormPanel](../src/features/login/components/LoginFormPanel.tsx). Adaptadores: [Configuracoes](../src/app/pages/Configuracoes.tsx), [RecuperarSenha](../src/app/pages/RecuperarSenha.tsx).
- Design system: [PeractSecretInput](../src/shared/components/peract-secret-input/PeractSecretInput.tsx), [types](../src/shared/components/peract-secret-input/PeractSecretInput.types.ts), [index](../src/shared/components/peract-secret-input/index.ts).
- [ADR](adr/001-seguranca-pessoal-recuperacao.md).

## Testes adicionados e atualizados

Novos:
- [Specification by Example UTF-8/exatidão](../src/core/security/security.validation.test.ts)
- [Contrato de status](../src/core/services/security-questions-status.service.test.ts)
- [Status, logout, troca de usuário, reload/dismiss/novo login](../src/core/security/useSecurityQuestionsStatus.test.tsx)
- [Banner: somente X, CTA/Escape/clique externo](../src/core/layout/SecurityQuestionsWarningBanner.test.tsx)
- [Provider real pós-login/restore e resposta stale](../src/app/context/AppContext.security.test.tsx)
- [Guards: público/deep link/flag/admin](../src/core/guard/AuthGuards.test.tsx)
- [Configurações por perfil/flag](../src/features/settings/SettingsPage.test.tsx)
- [UI cadastro, reautenticação, perguntas distintas e limpeza](../src/features/settings/components/SecurityQuestionsForm.test.tsx)
- [Contrato cadastro, CSRF dinâmico, trim só perguntas, erros e Retry-After](../src/features/settings/repository/security-questions.repository.test.ts)
- [Contrato recuperação pública, respostas/senha exatas, expiração](../src/features/password-recovery/repository/password-recovery.repository.test.ts)
- [Máquina de estados, duplo submit, cancelamento/stale, descarte de tokens](../src/features/password-recovery/facade/usePasswordRecoveryFacade.test.tsx)
- [UI recuperação completa, readonly/máscara, expiração, 429, erro único, sem storage/login automático](../src/features/password-recovery/PasswordRecoveryPage.test.tsx)

Atualizados: [AppLayout](../src/core/layout/AppLayout.test.tsx) para acesso pessoal do funcionário e [LoginFormPanel](../src/features/login/components/LoginFormPanel.test.tsx) para navegação/compatibilidade sem Router/flag. Teste existente de LoginPage não foi modificado.

## Verificação da entrega

- Vitest: 38 arquivos, 133 testes aprovados; cobertura executada com os thresholds definidos no projeto.
- TypeScript instalado como devDependency, junto das declarações Node/React; `npx --no-install tsc --noEmit` aprovado. Adaptadores legados truncados/duplicados e pequenas inconsistências de tipos foram corrigidos, sem mudança de regras de negócio.
- `npm run build` aprovado; permanece aviso de chunk principal acima de 500kB, fora do escopo desta feature.
- Backend: `mvn verify`, 471 testes sem falhas/erros/skips, incluindo falhas e resets concorrentes, empacotamento aprovado. OpenAPI YAML carregado sem erros sintáticos, 36 caminhos.
- Navegador real com H2 isolado: login sem perguntas, aviso, cadastro via cookie+CSRF, perguntas trimmed e respostas com espaços/acentos preservados, aviso permanece após salvar e só fecha no X, reload mantém fechamento, logout, recuperação pública, redefinição e novo login sem aviso.
- Interface inspecionada em desktop e mobile 390×844; tela de segurança sem overflow horizontal. Screenshots desta execução são inspeção, não baseline de regressão visual automatizada.
- SQL MySQL revisado e migração entregue, mas servidor local exige autenticação; banco vazio/populado e concorrência MySQL real não foram executados. Não houve alteração de credenciais/banco existente. Diagrama Workbench binário permanece pendente de reverse engineering; diagrama Mermaid entregue.
- A instalação identificou 11 vulnerabilidades na árvore npm (4 moderadas, 4 altas, 3 críticas). Não foi executado `npm audit fix --force`, para não aplicar atualizações incompatíveis sem revisão.

### Checklist para implantação e repetição da validação

1. Backend deve permitir CORS para origem frontend, GET/PUT/POST, credentials nos endpoints autenticados e headers CSRF dinâmico/X-Recuperacao-Token. **Expor Retry-After via Access-Control-Expose-Headers** para o navegador conseguir lê-lo.
2. Sessão backend deve autenticar por cookie nos endpoints pessoais; GET csrf deve materializar token válido para esse cookie. Respostas com tokens/perguntas devem ter Cache-Control no-store servidor. Usar HTTPS em produção.
3. Login incompleto → aviso → CTA → três perguntas+respostas+senhaAtual → 204 → texto atualizado → navegar/reload → aviso continua → X → reload sem aviso → logout/novo login completo sem aviso.
4. Funcionário: segurança acessível, estoque/clientes negados inclusive por URL; queries de estoque nas configurações não ampliam permissão.
5. Recuperação por URL direta: email → três perguntas readonly/respostas exatas → senha/confirmação → 204 → link login, sem sessão automática. Testar erro, 429 com prazo real, expiração, voltar/cancelar/refresh e cookie de sessão antigo.
6. Flag off: sem link/banner/form e deep-link recuperação negado.
7. Repetir a validação no ambiente destino com banco persistente e HTTPS. As inspeções e execução ponta-a-ponta desta sessão usam H2 isolado e não substituem a validação MySQL ou baselines visuais automatizados.