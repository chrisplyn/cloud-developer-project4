import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import { generateUploadUrl, todoExist } from '../../businessLogic/todo';
import { cors } from 'middy/middlewares';
import * as middy from 'middy';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
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

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  let url = await generateUploadUrl(todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)