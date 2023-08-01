import { FastifyInstance } from 'fastify';
import z from 'zod';
import { randomUUID } from 'node:crypto';
import { knex } from '../database';

// Todo o plugin precisa ser uma função assíncrona!
export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*'); // Sem asterisco, vazio, ele entende tb

    return { transactions };
  });

  app.get('/:id', async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionsParamsSchema.parse(request.params);

    const transaction = await knex('transactions').where('id', id).first(); // Primeiro com id

    return { transaction };
  });

  app.get('/summary', async () => {
    const summary = await knex('transactions').sum('amount', { as: 'amount' }).first(); // first() para entender que o retorno é um só; não um array

    return { summary };
  });

  app.post('/', async (request, reply) => {
    // Prefix no server já define o transactions depois da barra

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    }); // Schema para validar se o body está correto.

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days (clean code)
        // maxAge ou expires com new Date(), para determinar a duração do cookie;
      });
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1, // Débito fica negativo.
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
