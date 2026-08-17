```md
# Instruções de Arquitetura do Projeto React

Este projeto segue uma arquitetura modular baseada em features, com separação clara entre camada de aplicação, domínio e infraestrutura. O objetivo é manter o código organizado, escalável e fácil de evoluir.

## Visão Geral

A estrutura principal do projeto é organizada da seguinte forma:

- `core/`: contém a infraestrutura e funcionalidades transversais da aplicação.
- `features/`: organiza cada funcionalidade/tela em módulos independentes.
- `shared/`: contém elementos reutilizáveis entre múltiplas telas.
- `environment/`: concentra as configurações de ambiente.

## Estrutura de Pastas

### core/
Responsável por funcionalidades centrais e globais da aplicação.

- `services/`
  - Serviços de autenticação, tokens e demais serviços globais usados no frontend.
- `interceptor/`
  - Interceptadores para requisições HTTP, especialmente para tokens e tratamento de autenticação.
- `guard/`
  - Guards para controle de acesso às páginas e rotas.
- `layout/`
  - Layout global da aplicação, como header, sidebar, shell e estrutura visual comum.
- `logging/`
  - Gestão de logs para diferentes ambientes e servidores.

### features/
Cada funcionalidade deve ser organizada em um módulo próprio, com uma estrutura consistente.

- `features/<feature-name>/`
  - `components/`
    - Componentes específicos da feature.
    - Devem ser usados apenas dentro da feature.
  - `services/`
    - Regras de negócio da feature.
  - `repository/`
    - Camada de comunicação com o backend.
    - `dto/`: objetos que representam o contrato com o backend.
    - `mapper/`: conversão de DTOs para models da feature.
  - `facade/`
    - Centraliza a gestão de estado da feature e o acesso aos services.
  - `models/`
    - Modelos utilizados pela feature.
  - `config/`
    - Configurações específicas da feature, como configuração de tabela, opções de componentes e constantes locais.

### shared/
Contém funcionalidades reutilizáveis em múltiplas telas.

- `shared/components/`
  - Componentes genéricos e design system.
- `shared/utils/`
  - Funções utilitárias e helpers compartilhados.

### environment/
Armazena configurações de ambiente, como credenciais e variáveis de desenvolvimento, homologação e produção.

## Princípios de Arquitetura

- Cada feature deve ser encapsulada e independente.
- A lógica de negócio não deve ficar espalhada por componentes.
- Componentes em `shared/` devem ser genéricos e reutilizáveis.
- O acesso ao backend deve ocorrer por meio da camada `repository/` da feature.
- A `facade/` deve ser o ponto central de integração entre UI, estado e services.
- Lógica global da aplicação deve ficar em `core/`.
- Autenticação, tokens e interceptação de requisições devem ser tratados em `core/`.
- Logging deve ser centralizado e configurado por ambiente.

## Lazy Loading de Features

- Todas as features devem ser carregadas via lazy loading.
- A implementação deve ocorrer preferencialmente pelas rotas ou pontos de entrada da feature.
- Evite importar features diretamente no bundle principal quando não forem necessárias imediatamente.
- O lazy loading deve ser usado para melhorar performance inicial e reduzir o tamanho do bundle carregado no início da aplicação.
- Ao criar ou alterar uma feature, garanta que ela seja carregada de forma lazy e não de forma eager.

## Regras para Criação de Novas Funcionalidades

Ao criar uma nova feature, siga esta estrutura:

- `features/<feature-name>/components`
- `features/<feature-name>/services`
- `features/<feature-name>/repository`
- `features/<feature-name>/repository/dto`
- `features/<feature-name>/repository/mapper`
- `features/<feature-name>/facade`
- `features/<feature-name>/models`
- `features/<feature-name>/config`

## Diretrizes para Desenvolvimento

- Prefira reutilizar componentes e utilidades já existentes em `shared/`.
- Evite duplicação de lógica entre features.
- Se uma lógica for usada por múltiplas features, considere movê-la para `shared/` ou `core/` conforme o contexto.
- Mantenha nomes explícitos e consistentes.
- Não coloque lógica específica de uma feature em `shared/`.
- Não coloque regras de negócio global em componentes isolados.
- Sempre que possível, use a camada `facade/` para organizar o estado e chamadas da feature.
- Sempre que criar uma nova feature, implemente lazy loading na sua entrada de navegação.

## Instruções para o Copilot

Ao gerar ou alterar código neste projeto, siga estas regras:

- Preserve a estrutura de pastas e responsabilidades descritas acima.
- Mantenha a separação entre UI, negócio, infraestrutura e dados.
- Crie componentes específicos em `features/.../components` quando forem exclusivos da feature.
- Use `shared/` apenas para elementos realmente reutilizáveis.
- Centralize a lógica global em `core/`.
- Ao implementar chamadas HTTP, use a camada `repository/` e, quando necessário, o `core/interceptor/` para autenticação.
- Ao adicionar estado e integração com services, considere usar `facade/` como ponto central da feature.
- Evite acoplamento entre features.
- Sempre siga os padrões já existentes no projeto.
- Sempre aplique lazy loading nas features.
```