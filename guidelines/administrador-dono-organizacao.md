# Administrador dono da organizacao

## Regra

O usuario `admin@perfumaria.com` foi escolhido como dono da sua organizacao. Dono e administrador normal continuam com o mesmo perfil ADMIN e as mesmas funcionalidades administrativas.

O vinculo de dono fica em `Organizacao.fkDono`, referenciando o UUID do usuario. Mudar o e-mail nao remove a protecao e o nome exibido nao e usado para determinar propriedade.

- O dono nao pode ser excluido por nenhum usuario, incluindo ele mesmo.
- Administradores comuns nao podem editar nome, e-mail, senha ou cargo do dono pela gestao de funcionarios.
- O dono nao pode rebaixar seu proprio cargo para funcionario.
- O dono pode excluir administradores comuns; administradores comuns continuam gerenciando usuarios nao protegidos da mesma organizacao.
- A regra existente de impedir a exclusao do proprio administrador continua ativa para todos.
- As alteracoes de senha/e-mail da propria conta continuam disponiveis nas configuracoes.
- A API de funcionarios retorna `donoOrganizacao`, apenas para leitura. Formulario e DTO de cadastro/edicao nao atribuem propriedade.
- O dono visualiza todos os usuarios da propria organizacao, inclusive sua conta protegida, administradores comuns e funcionarios.
- Administradores comuns visualizam somente funcionarios na listagem e na busca. O filtro vale na API e na interface; nenhuma categoria de administrador aparece nessa lista.
- Para o dono, sua conta aparece como `Administrador (dono)` sem acoes de edicao/exclusao na gestao da equipe. Alteracoes da propria senha/e-mail continuam pelas configuracoes.

## Implantacao

O schema e os dados de inicializacao novos ja incluem o dono escolhido. Nao executar `data.sql` ou o schema inteiro em um banco com dados.

Para banco existente:

1. Fazer backup e confirmar que `admin@perfumaria.com` e ADMIN ativo e pertence a organizacao correta.
2. Verificar se `fkDono` e a chave estrangeira ja existem. Se existirem, nao repetir os ALTERs.
3. Executar uma unica vez `docs/migracao-dono-organizacao.sql` do backend. O tipo UUID acompanha o schema H2 do projeto; em outro banco, a coluna deve usar exatamente o tipo de `Usuario.idUsuario`.
4. Conferir a consulta final da migracao. O UPDATE nao substitui um dono existente e nao define dono quando o usuario nao e administrador ativo.
5. Recompilar e reiniciar o backend e recarregar o frontend. Sair e entrar novamente para atualizar `donoOrganizacao` na sessao autenticada; sessoes antigas sem esse campo usam a visibilidade restrita de administrador comum.

A migracao nao foi executada automaticamente no banco da aplicacao. Outras organizacoes devem ter seus donos definidos explicitamente, pelo UUID de um ADMIN ativo da propria organizacao. A interface administrativa normal nao permite transferir propriedade.

## Protecao

O backend valida as regras antes de editar/excluir e a chave estrangeira usa `ON DELETE RESTRICT` como defesa adicional contra exclusao do usuario dono. Exclusao negada nao remove dados. Tentativas de edicao por outro administrador retornam 403, e rebaixamento do dono retorna 400.

Testes de integracao foram executados em H2 isolado; nenhuma conta real foi excluida ou editada durante a implementacao.