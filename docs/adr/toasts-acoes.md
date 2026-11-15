# ADR — Feedback global para ações do usuário

## Decisão

Reutilizar Sonner, já instalado, por meio do contrato compartilhado `actionToast.success(title, description)` e `actionToast.error(title, description)`. Montar um único `PeractToaster` na raiz, inclusive nas rotas públicas, preservando notificações durante navegação.

- Sucesso: fundo verde claro, borda e ícone verde, título e descrição.
- Falha: fundo vermelho claro, borda e ícone vermelho; orientação padrão “Tente novamente mais tarde”.
- Fechamento manual acessível e fechamento automático após cinco segundos.
- Facades notificam apenas ações explícitas concluídas/rejeitadas. Carregamentos automáticos, filtros e navegação não geram toasts.
- Erros e validações inline são preservados. Falha de atualização da lista após uma gravação bem-sucedida não deve comunicar falha da gravação.
- Tokens, respostas de segurança e erros técnicos não são incluídos nas notificações.

## Justificativa

Evitar múltiplos provedores, dependências novas e implementações divergentes. A camada compartilhada define o feedback visual; as facades mantêm mensagens e regras próprias dos domínios (SOLID e arquitetura em camadas).

## Validação

TDD e cenários Given/When/Then, com Specification by Example para perfume/decant e sucesso/falha. Testes verificam título, descrição, ícone, semântica de cor e sucesso somente após a confirmação da operação.