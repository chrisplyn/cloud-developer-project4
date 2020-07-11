import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo, todoExist } from '../../businessLogic/todo'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event);
  const validItem = await todoExist(userId, todoId)

  if (!validItem) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: `Unable to find Todo'${todoId}' for user '${userId}'`
      })
    }
  }

  await updateTodo(userId, todoId, updatedTodo)
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

