import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import { deleteTodo } from '../../businessLogic/todo';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  // TODO: Remove a TODO item by id
  await deleteTodo(userId, todoId)
  return {
    statusCode: 200,
    body: " "
  }
})

handler.use(
  cors({
    credentials: true
  })
)