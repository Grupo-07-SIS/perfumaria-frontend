
---
description: "Use when: criar ou refatorar componentes do Design System Peract, aplicar classes globais, usar children no lugar de texto via props e padronizar shared/components."
applyTo: "src/shared/components/**"
---

# Design System Peract

## Estrutura obrigatória

- Todo componente reutilizável do Peract deve ficar em `src/shared/components/`.
- Cada componente deve ter sua própria pasta com prefixo `peract-`.
- O arquivo global `src/shared/components/globalStyle.css` concentra tokens, classes globais e estilos-base.

Exemplo:

```txt
src/shared/components/
  globalStyle.css
  peract-button/
    PeractButton.tsx
    PeractButton.types.ts
    index.ts
```

## Regras de API

- Use props para comportamento, estado e configuração visual.
- Para conteúdo textual visível, prefira `children`.
- `label`, `title` e `content` só podem existir como fallback de compatibilidade, nunca como API principal.
- Em React, `children` cumpre o papel análogo ao `ng-content` do Angular: o conteúdo vem entre as tags do componente.

Exemplo recomendado:

```tsx
<PeractButton theme="primary">Salvar</PeractButton>

<PeractCard>
  <h3>Título</h3>
  <p>Conteúdo</p>
</PeractCard>
```

## Regras visuais

- Nunca aplicar `var(--token)` diretamente em várias telas quando uma classe global Peract puder representar esse papel.
- Use as classes globais `peract-*` para cor, tipografia, superfície, borda, raio e estados.
- Evite estilo inline; use inline apenas quando o valor é realmente dinâmico por instância.
- A paleta deve respeitar a proporção visual da marca: branco dominante, preto/cinza de apoio e dourado reservado para destaque.

## Tipografia

- Serif institucional: `peract-serif-font`.
- Sans principal: `peract-sans-font`.
- Peso padrão: `peract-font-weight-normal` e `peract-font-weight-medium`.

## Acessibilidade

- Componentes interativos devem suportar foco visível.
- Inputs e selects devem expor label, estado de erro e required.
- Componentes de ação devem manter contraste suficiente e texto compreensível.

## Checklist

- O componente está em `shared/components/peract-*`.
- Existe `index.ts` e arquivo de tipos.
- O estilo se baseia em classes globais Peract.
- O texto principal usa `children`.
- O componente é reutilizável e não depende de uma feature específica.

