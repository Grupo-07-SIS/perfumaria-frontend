---
description: "Use when: refatorar o frontend para feature-based architecture, mover pages para features, separar shared/core/app, aplicar lazy loading e organizar formularios com React Hook Form."
applyTo: "src/**"
---

# Arquitetura Frontend Peract

## Camadas

- `src/app/`: bootstrap, rotas, providers e adaptadores de compatibilidade.
- `src/core/`: layout global, comportamento transversal e infraestrutura visual compartilhada pela aplicação inteira.
- `src/features/`: módulos de negócio isolados por tela ou fluxo.
- `src/shared/`: design system, utilitários e componentes verdadeiramente reutilizáveis.

## Regras de modularização

- A entrada principal da feature deve nascer no root da própria pasta, por exemplo `src/features/<feature>/<FeatureName>Page.tsx`.
- Componentes específicos da feature devem ficar em `src/features/<feature>/components/`.
- Regras de negócio da feature devem ficar em `src/features/<feature>/services/`.
- Chamadas de dados e integração da feature devem passar por `src/features/<feature>/repository/`.
- Contratos de entrada e saída do repository devem ficar em `src/features/<feature>/repository/dto/`.
- Conversões entre DTOs e models da feature devem ficar em `src/features/<feature>/repository/mapper/`.
- Models da feature devem ficar em `src/features/<feature>/models/`.
- Configurações específicas da feature devem ficar em `src/features/<feature>/config/`.
- O `facade` da feature deve centralizar estado e acesso a `services` em `src/features/<feature>/facade/`.
- `src/app/pages/*` pode existir apenas como reexport de compatibilidade enquanto a migração não terminar.
- `src/app/routes.ts` deve lazy-loadar features sempre que possível.

## Estado e formulários

- Use estado local como padrão para comportamento local.
- Use `react-hook-form` em formulários de entrada do usuário quando houver validação, submit ou composição com componentes do design system.
- Use `Controller` quando o campo compartilhado não expõe a API nativa de `onChange/value`.

## Design system

- Componentes visuais reutilizáveis pertencem a `src/shared/components/`.
- Features consomem o design system; não recriam botões, inputs, selects, cards ou tags localmente.
- Header e sidebar pertencem a `src/core/layout/` e devem usar classes globais Peract.

## Migração incremental

- Mova primeiro a implementação real para `features` ou `core`.
- Depois troque a origem das rotas/imports.
- Por fim, mantenha reexports temporários em `app/` apenas quando necessário para compatibilidade.

## Checklist de refactor

- A página foi movida para `features`.
- A rota faz lazy loading da feature.
- O layout global ficou em `core`.
- O design system foi consumido a partir de `shared`.
- Não restou lógica de domínio dentro de `shared`.