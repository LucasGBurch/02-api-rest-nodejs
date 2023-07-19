import fastify from 'fastify';
import crypto from 'node:crypto';
import { knex } from './database';
import { env } from './env';

const app = fastify();

app.get('/hello', async () => {
  // const tables = await knex('sqlite_schema').select('*');
  // return tables; Experimentando outras operações:

  // // Inserção:
  // const transactions = await knex('transactions')
  //   .insert({
  //     id: crypto.randomUUID(),
  //     title: 'Transação de teste',
  //     amount: 1000,
  //   })
  //   .returning('*'); // Returning faz a rota retornar os dados da transação, e não só um [1]

  // Busca/select:
  const transactions = await knex('transactions')
    .where('amount', 1000)
    .select('*'); // Só o select * seleciona todos na busca
  return transactions;
});

app.listen({ port: env.PORT }).then(() => console.log('HTTP Server Running!'));
