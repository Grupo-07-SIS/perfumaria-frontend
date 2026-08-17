# Skill: Criar componentes no Design System Peract

Esta skill orienta como criar novos componentes no Design System Peract, preservando consistência visual, acessibilidade, reutilização e a linguagem de interface da marca.

## Objetivo

Ao criar um novo componente, siga sempre estas diretrizes:

- usar tokens e classes globais como base;
- manter visual consistente com os demais componentes;
- seguir a identidade elegante e premium do Peract;
- priorizar acessibilidade e clareza;
- evitar props desnecessárias para conteúdo textual.

## 1. Regras gerais

### 1.1 Use classes globais e tokens
- Baseie o estilo do componente em classes globais e tokens do design system.
- Evite estilos inline desnecessários.
- Prefira reutilizar componentes e padrões já existentes.

Exemplo:
```tsx
<div className="peract-bg-card peract-radius peract-border">
  ...
</div>
```

### 1.2 Preserve a identidade visual do Peract
- Use branco, cinza, preto e dourado com equilíbrio.
- O dourado deve destacar elementos sem exagerar.
- Mantenha layouts limpos, sofisticados e consistentes.

### 1.3 Priorize acessibilidade
- Use labels claros.
- Garanta contraste adequado.
- Forneça estados visuais para foco, hover, erro, sucesso e desabilitado.
- O componente deve funcionar bem em teclado e para tecnologias assistivas.

## 2. Como criar um componente

### 2.1 Estrutura
- Crie o componente em um local adequado do design system, como `shared/components`.
- Use nomes claros e consistentes com o prefixo `Peract`.
- Exporte o componente de forma reutilizável.

### 2.2 Estilo
- Aplique classes globais e tokens.
- Mantenha o componente visualmente padronizado.
- Evite variações ad hoc que não façam parte do design system.

### 2.3 API
- Mantenha props simples e semânticas.
- Use props para comportamento e configuração, não para conteúdo textual principal.

## 3. Regra obrigatória: conteúdo textual deve usar Children do React

Todos os atributos que representam texto visível do componente devem usar `children` do React, e não props de string.

### 3.1 Regra principal
Se o atributo serve para escrever texto na interface, use `children`.

Exemplos de props que devem virar `children`:
- `label`
- `title`
- `content`
- `description`
- `caption`
- `text`

### 3.2 Exemplo correto
```tsx
<PeractButton theme="primary">
  Salvar
</PeractButton>
```

### 3.3 Exemplo incorreto
```tsx
<PeractButton label="Salvar" />
```

### 3.4 Exemplo com conteúdo rico
```tsx
<PeractCard>
  <h3>Título do card</h3>
  <p>Descrição do conteúdo</p>
</PeractCard>
```

## 4. Padrão recomendado para props

Prefira este padrão:
```tsx
type PeractComponentProps = {
  children: React.ReactNode;
  theme?: 'primary' | 'secondary';
  disabled?: boolean;
};
```

Em vez de:
```tsx
type PeractComponentProps = {
  label?: string;
  title?: string;
  content?: string;
};
```

## 5. Componentes do Design System Peract

### 5.1 `PeractButton`
```tsx
<PeractButton theme="primary">
  Enviar
</PeractButton>
```

### 5.2 `PeractTag`
```tsx
<PeractTag type="accent">
  Novo
</PeractTag>
```

### 5.3 `PeractCard`
```tsx
<PeractCard>
  <h3>Título</h3>
  <p>Conteúdo</p>
</PeractCard>
```

### 5.4 `PeractModalAction`
```tsx
<PeractModalAction>
  <p>Deseja continuar com esta ação?</p>
</PeractModalAction>
```

## 6. Props permitidas

Props como estas podem continuar existindo, pois não são conteúdo textual principal:

- `theme`
- `variant`
- `icon`
- `placeholder`
- `disabled`
- `required`
- `onClick`
- `type`

## 7. Checklist ao criar um componente

Antes de finalizar, confirme:

- [ ] O componente segue a identidade visual do Peract.
- [ ] O estilo usa tokens e/ou classes globais.
- [ ] O componente é reutilizável.
- [ ] O componente é acessível.
- [ ] O conteúdo textual usa `children` do React.
- [ ] Não foram criadas props redundantes para texto.
- [ ] O componente está alinhado com os padrões do design system.

## 8. Diretriz final

Sempre que criar um componente no Design System Peract, pense em:
- consistência;
- reutilização;
- semântica;
- acessibilidade;
- e conteúdo textual via `children` do React.