import { FastifyReply, FastifyRequest } from "fastify";

// Função middleware para validar se há sessionId, ou seja, o nosso cookie para que a requisição seja válida
export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized'
    });
  }
}