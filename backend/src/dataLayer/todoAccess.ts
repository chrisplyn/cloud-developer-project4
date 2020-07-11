import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: 'v4'})
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class TodoAccess{
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.TODOS_S3_BUCKET) {}

    //add todo item to dynamodb
    async createTodo(todoItem: TodoItem): Promise<TodoItem>  {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        return todoItem
    }        
    
    async getTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        var params = {
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set #n = :a, dueDate=:d, done=:s",
            ExpressionAttributeValues: {
                ":a": todoUpdate.name,
                ":d": todoUpdate.dueDate,
                ":s": todoUpdate.done
            },
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ReturnValues: "UPDATED_NEW"
        };

        await this.docClient.update(params).promise()
        return todoUpdate
    }
    
    async deleteTodo(userId: string, todoId: string): Promise<String> {
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
        
        return ''
    }

    async generateUploadUrl(todoId: string): Promise<String> {
        return getUploadUrl(todoId, this.bucketName)
       
    }

    async todoExist(userId: string, todoId: string): Promise<boolean> {
        const result = await this.docClient
            .get({
                TableName: this.todoTable,
                Key: {
                    userId: userId,
                    todoId: todoId
                }
            }).promise()

        return !!result.Item
    }
}


function getUploadUrl(todoId: string, bucketName: string): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    })
}

function createDynamoDBClient() {
    //using local dynamodb offline
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
}
