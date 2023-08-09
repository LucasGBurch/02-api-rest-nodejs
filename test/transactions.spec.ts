import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready(); // O teste dava 404 not found na resposta por não esperar o app estar pronto. Este beforeAll corrige isso. Ele espera o Fastify terminar de cadastrar os plugins
  });

  afterAll(async () => {
    await app.close(); // É importante fechar a aplicação também.
  });

  // beforeEach é mais adequado para rodar a migration, em vez de beforeAll, porque o banco de dados precisa estar zerado para CADA UM DOS TESTES. Para isso, executamos um "rollback --all" antes do latest, para zerar os testes. Isso custa cada vez mais tempo a cada vez que os testes rodam, o que explica por que testes e2e precisam ser poucos e bons. Esses comandos de terminal são executados em código aqui graças ao execSync.
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
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

  it('should be able to list all transactions', async () => {
    // Repete o teste anterior para gerar o cookie necessário para listagem:
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');
    // console.log(cookies);

    // Validando resposta positiva da listagem, com o cookie necessário:
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies) // Docs do supertest
      .expect(200);
    // console.log(listTransactionsResponse.body)

    // Validando os dados com expect do vitest:
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      })
    ]);
  });

  it('should be able to get a specific transactions', async () => {
    // Repete o teste anterior para gerar o cookie necessário para listagem:
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies) // Docs do supertest
      .expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies) // Docs do supertest
    .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      })
    );
  });

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      });

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies) // Docs do supertest
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  });
});
