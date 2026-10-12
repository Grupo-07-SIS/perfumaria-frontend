# Controle de estoque nas vendas

## Regras implementadas

- Apenas produtos completos possuem estoque de unidades.
- Decants e Body Splash fracionados nao validam, reservam ou baixam estoque do produto-base.
- Vendas presenciais nascem FINALIZADAS; vendas online nascem PENDENTES.
- Ambos os canais reservam as unidades de produtos completos no cadastro. `estoqueAtual` representa as unidades ainda disponiveis para novas vendas.
- Finalizar um pedido online nao baixa essas unidades novamente.
- Cancelar devolve uma reserva uma unica vez. Reativar uma venda cancelada exige nova reserva e disponibilidade.
- Vendas antigas sem registro de reserva nao devolvem unidades automaticamente ao cancelar, evitando aumentar indevidamente o estoque.

## Protecoes

O carrinho rejeita quantidades invalidas e acima do estoque, considera o total do item ja adicionado e desabilita novas adicoes no limite. Produtos completos sem estoque verificavel nao podem ser adicionados. O catalogo e recarregado depois de registrar a venda.

No backend, a reserva soma produtos completos repetidos e usa uma atualizacao condicional atomica: o banco so reduz o estoque se houver unidades suficientes. A criacao da venda, a reserva e os itens estao na mesma transacao. Uma falha faz rollback integral.

Atualizacoes e cancelamentos bloqueiam a linha da venda para evitar devolucoes duplicadas em requisicoes simultaneas. As reservas de varios produtos seguem ordem de ID.

## Implantacao em banco existente

Foi adicionada a coluna `Venda.estoqueReservado`, com valor inicial FALSE. Ela distingue reservas reais das vendas legadas que foram registradas sem baixa.

Antes de iniciar a nova versao em um banco persistente:

1. Fazer backup e verificar se a coluna ja existe.
2. Se ainda nao existir, executar uma unica vez o arquivo `docs/migracao-reserva-estoque.sql` do backend:

```sql
ALTER TABLE Venda ADD COLUMN estoqueReservado BOOLEAN NOT NULL DEFAULT FALSE;
```

3. Recompilar e reiniciar o backend.

Nao executar `schema.sql` completo sobre o banco com dados. O schema atualizado serve para inicializacoes novas. A migracao acima nao foi executada automaticamente no banco da aplicacao.

Vendas anteriores nao foram utilizadas para recalcular o estoque. Como elas nao tinham baixa registrada, fazer conciliacao do saldo real e dos pedidos antigos antes de assumir que o estoque historico esta correto. Nao marcar vendas antigas como reservadas sem conciliar as respectivas unidades.

## Validacao

- Frontend: 75 testes aprovados nos fluxos de vendas e historico.
- Backend: 93 testes aprovados de servico e integracao em H2 em memoria.
- Concorrencia: duas vendas disputam a ultima unidade; uma retorna 201 e a outra 400, com estoque final zero e apenas uma venda criada.
- Cobertos: reservas presencial/online, itens repetidos, devolucao idempotente, reativacao, vendas legadas e fracionados com estoque completo zerado.
- Nenhuma venda real foi criada, cancelada ou editada durante a validacao.