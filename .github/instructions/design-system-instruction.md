

```md
# Instrução de Arquitetura para Componentes no Design System Peract

Todos os componentes reutilizáveis do Design System devem ser criados dentro da pasta `shared/components/`, seguindo uma estrutura modular, organizada e consistente.

## Estrutura base

Cada componente deve ser mantido em sua própria pasta, com o prefixo `peract-` no nome.

Exemplo:

```txt
shared/components/
  globalStyle.css
  peract-tag/
    TagComponent.tsx
    tagStyle.css
    tagModel.ts
    tag.test.tsx
    index.ts
```

## Regras de organização

### 1. Pasta do componente
- O nome da pasta deve seguir o padrão:
  - `peract-<nome-do-componente>/`

Exemplos:
- `peract-tag/`
- `peract-button/`
- `peract-input/`

### 2. Arquivos esperados dentro da pasta do componente
Cada componente deve seguir esta estrutura mínima:

- `ComponentName.tsx`
  - Implementação do componente React.

- `componentNameStyle.css` ou `style.css`
  - Estilos específicos do componente.

- `componentNameModel.ts` ou `componentName.types.ts`
  - Tipos, interfaces e modelos do componente.

- `componentName.test.tsx`
  - Testes do componente, quando aplicável.

Opcionalmente:
- `index.ts`
  - Arquivo para exportação do componente.

## Arquivo global de estilos

O arquivo `shared/components/globalStyle.css` deve concentrar:

- tokens de design;
- variáveis CSS;
- classes globais reutilizáveis;
- estilos base do Design System.

### Regras:
- Tokens e variáveis globais não devem ficar espalhados por componentes.
- Componentes devem consumir classes globais e tokens definidos nesse arquivo.
- Evite estilos inline e estilos duplicados.

## Regras de estilo

- Use classes globais do Design System para cor, tipografia, borda, raio e espaçamento.
- Estilos específicos do componente podem ficar no arquivo local de estilo da pasta.
- Mantenha consistência visual com os demais componentes do Peract.
- Evite criar estilos ad hoc fora do padrão do design system.

## Regras de API do componente

- Props devem ser simples, semânticas e reutilizáveis.
- Atributos que representam texto visível devem usar `children` do React, e não props como `label`, `title` ou `content`.

Exemplo correto:
```tsx
<PeractButton>
  Salvar
</PeractButton>
```

Exemplo incorreto:
```tsx
<PeractButton label="Salvar" />
```

## Regras para criação de novos componentes

Ao criar um novo componente, siga este fluxo:

1. Criar a pasta `shared/components/peract-<nome>/`
2. Criar o componente principal em `ComponentName.tsx`
3. Criar o arquivo de estilo em `style.css`
4. Criar tipos/interfaces em `componentNameModel.ts`
5. Adicionar testes, se necessário
6. Garantir que o componente siga o padrão visual do Design System Peract

## Diretriz final

Sempre que criar um componente em `shared/components/*`, mantenha:

- organização por pasta;
- separação entre lógica, estilo e tipos;
- uso de tokens e classes globais;
- consistência com o Design System Peract;
- API limpa e acessível.
```

