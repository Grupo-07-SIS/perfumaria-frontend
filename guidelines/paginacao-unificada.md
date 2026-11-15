# Paginacao unificada

## Padrao visual

Decants, Body Splash, historico de vendas, pedidos online, clientes, fornecedores e funcionarios usam o mesmo `PeractPaginationFooter`, com dez itens por pagina, faixa `Exibindo X a Y de Z` e controles Anterior/numeros/Proxima quando ha mais de uma pagina.

O rodape e os dados paginados estao disponiveis nos layouts desktop e mobile. Clientes e fornecedores mantem tabelas com rolagem horizontal em telas estreitas; o rodape fica fora da area de rolagem da tabela.

## Carregamento

- Decants e Body Splash consultam uma pagina do backend por vez, com tamanho 10 e indice de API iniciado em zero. A UI inicia em um. Totais usam os metadados da resposta.
- Historico, pedidos e pessoas seguem o comportamento de referencia do historico: carregam os resultados disponiveis e paginam o conjunto filtrado no frontend. Endpoints que retornam paginas sao percorridos durante o carregamento; fornecedores e funcionarios mantem seus contratos de lista existentes.
- O lote de 100 usado para buscar clientes NAO e limite de listagem. O repository percorre as paginas restantes, e o usuario pode navegar normalmente pelos registros 101 em diante. O mesmo vale para os lotes de carregamento do historico e de pedidos.
- Busca, filtros e troca de aba reiniciam a navegacao em um. Contagens e indicadores representam o conjunto filtrado, nao apenas os dez registros visiveis.
- A paginacao local ajusta uma pagina que deixou de existir apos alteracao dos dados. Nos catalogos remotos, a exclusao do ultimo item da ultima pagina recarrega a pagina anterior e atualiza os totais.

## Verificacao

- `npm test -- --reporter=dot`: 128 arquivos e 953 testes aprovados, sem falhas.
- `npm run build`: aprovado; aviso de chunk superior a 500 kB mantido, sem relacao com limite de registros.
- Testes especificos incluem as tres abas de pessoas, 105 clientes na tela, 25 pedidos, navegacao e busca de Body Splash, controles de Decants, historico e exclusao do ultimo registro de paginas remotas.
- Testes de componente exercitam os dois conjuntos de controles desktop/mobile em JSDOM; isso nao equivale a uma auditoria visual de todos os viewports nem a confirmacao do backend implantado.
- Nenhum contrato de backend foi alterado, nenhuma dependencia foi instalada e nenhum registro real foi criado para essa validacao.