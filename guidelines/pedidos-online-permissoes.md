# Permissoes de pedidos online

ADMIN e FUNCIONARIO podem acessar `/vendas/pedidos`, consultar pedidos da propria organizacao e finalizar vendas online pendentes.

| Endpoint | Perfis | Escopo |
| --- | --- | --- |
| `GET /vendas/pedidos-online?page=0&size=100` | ADMIN, FUNCIONARIO | Pagina somente de vendas ONLINE da organizacao autenticada. |
| `GET /vendas/pedidos-online/{id}` | ADMIN, FUNCIONARIO | Detalhes de uma venda ONLINE da mesma organizacao. |
| `PATCH /vendas/pedidos-online/{id}/finalizar` | ADMIN, FUNCIONARIO | Finalizacao operacional sem alterar pagamento, desconto ou canal. |

O corpo de finalizacao e `{}` para Site e `{ "codigoRastreio": "..." }` para WhatsApp. O rastreio e exigido para WhatsApp. Pedido ja finalizado retorna seu estado atual sem nova baixa de estoque; pedido cancelado e rejeitado. Pedido presencial ou de outra organizacao retorna 404.

O funcionario nao pode cancelar, desfazer a finalizacao, remover rastreio ou editar uma venda pela rota administrativa. O frontend oculta essas acoes e o backend mantem `PATCH /vendas/{id}` e os DELETEs exclusivos de ADMIN. Historico de vendas e demais telas administrativas continuam protegidos.

Recompilar e reiniciar o backend antes de usar o frontend atualizado: a tela de pedidos passa a depender dos endpoints acima, sem fallback para a listagem administrativa.

## Categorias nos recibos

Os itens de venda retornam `categoriaNome`, obtido da categoria do produto-base. O frontend exibe a categoria abaixo do nome no recibo do historico e nos detalhes de pedidos online. O campo e opcional para compatibilidade com respostas sem categoria; nao ha deducao pelo nome do produto.

## Verificacao

- 55 testes de integracao de vendas aprovados no backend em H2 isolado.
- 27 testes do layout e 31 testes de historico/pedidos aprovados no frontend.
- Cobertos: finalizacao Site/WhatsApp por funcionario, rastreio obrigatorio, preservacao das restricoes administrativas, isolamento por organizacao, rejeicao de pedido cancelado, reserva de estoque e categoria no recibo.
- Nenhuma venda real foi finalizada durante a implementacao.