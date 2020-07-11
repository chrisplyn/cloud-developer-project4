import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { cors } from 'middy/middlewares'
import { createTodo} from '../../businessLogic/todo'
import * as middy from 'middy'
import { getUserId } from '../utils'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event);
  // TODO: Implement creating a new TODO item
  const todoItem = await createTodo(newTodo, userId)

  return {
    statusCode: 201,
    body: JSON.stringify({item: todoItem})
  }
})

handler.use(
  cors({
    credentials: true
  })
)