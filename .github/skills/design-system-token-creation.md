# Skill: Criar tokens no Design System Peract

Esta skill orienta como criar novos tokens no Design System Peract, mantendo consistência visual, semântica e aderência à identidade premium do projeto.

## Objetivo

Ao criar um novo token, siga sempre estas diretrizes:

- preservar a identidade visual do Peract;
- manter consistência entre os temas claro e escuro;
- usar tokens como base para estilos reutilizáveis;
- evitar estilos hardcoded diretamente em componentes;
- priorizar nomes semânticos e escaláveis.

## 1. Regras gerais

### 1.1 Use tokens como fonte única de verdade
- Defina tokens em variáveis CSS no `:root`.
- Quando necessário, defina também a versão correspondente no tema escuro `.dark`.
- Use esses tokens para construir classes globais reutilizáveis.

Exemplo:
```css
:root {
  --brand-accent: #c29958;
  --background: #f7f7f6;
  --foreground: #1a1a1a;
}

.dark {
  --background: #0a0800;
  --foreground: #fafaf9;
}
```

### 1.2 Prefira classes globais a estilos diretos
- Em vez de aplicar `var()` diretamente em componentes, crie classes globais.
- Isso melhora reutilização, manutenção e padronização.

Exemplo:
```css
.peract-font-color-accent {
  color: var(--brand-accent);
}

.peract-bg-background {
  background-color: var(--background);
}
```

### 1.3 Mantenha a identidade visual do Peract
- A paleta principal deve continuar baseada em branco, cinza, preto e dourado.
- O dourado deve ser usado com moderação para destaques e elementos estratégicos.
- Preserve contraste, elegância e simplicidade visual.

## 2. Tipos de tokens

### 2.1 Cores
Crie tokens para:
- cores de marca;
- cores de fundo;
- cores de texto;
- cores de destaque;
- cores semânticas (success, warning, alert, destructive).

Exemplo:
```css
:root {
  --brand-accent: #c29958;
  --brand-dark: #1a1a1a;
  --destructive: #d4183d;
}
```

### 2.2 Tipografia
Crie tokens para:
- pesos de fonte;
- tamanhos de fonte;
- espaçamento entre letras;
- famílias tipográficas.

Exemplo:
```css
:root {
  --font-weight-medium: 500;
  --font-weight-normal: 400;
}
```

### 2.3 Espaçamento, raio e bordas
Crie tokens para:
- espaçamento;
- raio de borda;
- largura de borda;
- sombras, quando necessário.

Exemplo:
```css
:root {
  --radius: 0.625rem;
  --border: rgba(0, 0, 0, 0.09);
}
```

## 3. Como criar um novo token

1. Identifique o tipo do token:
   - cor;
   - tipografia;
   - espaçamento;
   - raio;
   - sombra;
   - estado visual.

2. Defina o token no `:root`.

3. Se houver necessidade de tema escuro, defina a versão correspondente em `.dark`.

4. Crie uma classe global reutilizável associada ao token.

5. Use essa classe em vez de aplicar o valor diretamente no componente.

Exemplo:
```css
:root {
  --new-token: #123456;
}

.dark {
  --new-token: #abcdef;
}

.peract-color-new-token {
  color: var(--new-token);
}
```

## 4. Nomeação

- Use nomes claros e semânticos.
- Prefira nomes baseados no papel do token, e não na aparência isolada.
- Exemplos:
  - `--brand-accent`
  - `--surface-card`
  - `--text-muted`
  - `--radius-lg`

## 5. Checklist ao criar um token

Antes de finalizar, confirme:

- [ ] O token foi definido no tema base.
- [ ] O token foi adaptado para o tema escuro, quando necessário.
- [ ] Existe uma classe global associada.
- [ ] O nome é semântico e reutilizável.
- [ ] O token está alinhado com a paleta Peract.
- [ ] O token não foi criado para um caso único sem necessidade.

## 6. Diretriz final

Sempre que criar um token no Design System Peract, pense em:
- consistência;
- reutilização;
- semântica;
- clareza;
- e alinhamento com a identidade visual da marca.