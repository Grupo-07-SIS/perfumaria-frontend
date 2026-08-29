---
name: refactor-peract-feature-based
description: "Use when: migrar páginas ou componentes para a arquitetura feature-based do Peract, mover código para shared/core/features, padronizar design system e preparar lazy loading com compatibilidade incremental."
---

# Skill: Refactor Feature-Based Peract

Esta skill orienta refactors incrementais do frontend Peract sem perder compatibilidade durante a migração.

## Quando usar

- mover páginas de `app/pages` para `features`;
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
- `app` apenas compõe bootstrap, providers e rotas.

## Regras de design system

- use classes globais `peract-*` antes de criar novo CSS local;
- use `children` como API principal para conteúdo textual;
- use `react-hook-form` quando o formulário tiver validação real;
- evite estilos inline fixos repetidos em várias telas.

## Resultado esperado

- páginas em `features`;
- layout em `core`;
- componentes reutilizáveis em `shared`;
- rotas com lazy loading;
- compatibilidade preservada durante a migração.