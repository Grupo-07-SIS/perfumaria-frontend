---
name: refactor-peract-feature-based
description: "Use when: migrar páginas ou componentes para a arquitetura feature-based do Peract, mover código para shared/core/features, padronizar design system e preparar lazy loading com compatibilidade incremental."
---

# Skill: Refactor Feature-Based Peract

Esta skill orienta refactors incrementais do frontend Peract sem perder compatibilidade durante a migração.

## Quando usar

- mover páginas de `app/pages` para o root da pasta da feature em `features`;
- mover layout global para `core/layout`;
- extrair componentes reutilizáveis para `shared/components`;
- trocar botões, inputs, selects, tags, tabelas e cards ad hoc por componentes Peract;
- preparar lazy loading nas rotas.

## Fluxo obrigatório

1. Identificar a página ou componente dono do comportamento.
2. Mover a implementação real para `features`, `core` ou `shared`.
3. Deixar um reexport temporário na origem antiga quando a compatibilidade ainda for necessária.
4. Atualizar a rota ou ponto de composição para usar lazy loading.
5. Validar com `get_errors` e build quando o ambiente permitir.

## Regras de arquitetura

- `shared` não conhece regra de negócio.
- `core` concentra layout e infraestrutura transversal.
- `features` encapsula a UI e o comportamento da funcionalidade.
- a página principal da feature deve ficar no root da pasta da feature, sem subpasta `pages`;
- cada feature deve seguir a estrutura `components`, `services`, `repository`, `repository/dto`, `repository/mapper`, `facade`, `models` e `config` quando houver responsabilidade correspondente;
- acesso a backend ou fonte de dados da feature deve entrar por `repository`, não direto pela página ou por `shared`;
- `app` apenas compõe bootstrap, providers e rotas.

## Regras de design system

- use classes globais `peract-*` antes de criar novo CSS local;
- use `children` como API principal para conteúdo textual;
- use `react-hook-form` quando o formulário tiver validação real;
- evite estilos inline fixos repetidos em várias telas.

## Resultado esperado

- páginas no root de `features/<feature>`;
- layout em `core`;
- componentes reutilizáveis em `shared`;
- rotas com lazy loading;
- compatibilidade preservada durante a migração.