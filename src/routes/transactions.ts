import { FastifyInstance } from 'fastify';
import z from 'zod';
import { randomUUID } from 'node:crypto';
import { knex } from '../database';

// Todo o plugin precisa ser uma função assíncrona!
export async function transactionRoutes(app: FastifyInstance) {
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

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1, // Débito fica negativo.
    });

    return reply.status(201).send();
  });
}
