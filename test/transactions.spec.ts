import { it, beforeAll, afterAll, describe } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready(); // O teste dava 404 not found na resposta por não esperar o app estar pronto. Este beforeAll corrige isso. Ele espera o Fastify terminar de cadastrar os plugins
  });

  afterAll(async () => {
    await app.close(); // É importante fechar a aplicação também.
  });

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201);
    // como se fosse expect(response.statusCode).toEqual(201), com response armazenando essa chamada do await
  });

});
