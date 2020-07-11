import 'source-map-support/register'
import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todo = new TodoAccess()
const bucketName = process.env.TODOS_S3_BUCKET

export async function getTodos(userId: string): Promise<TodoItem[]> {
    return await todo.getTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
    ): Promise<TodoItem> {
    const todoId = uuid.v4()
    const newTodo: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    return await todo.createTodo(newTodo)
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
    ): Promise<TodoUpdate> {

    const updatedTodo: TodoUpdate = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    }

    return await todo.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(userId: string, todoId: string): Promise<String>  {
    return await todo.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(todoId: string):  Promise<String>{
    return await todo.generateUploadUrl(todoId)
}

export async function todoExist(userId: string, todoId: string): Promise<boolean>{
    return await todo.todoExist(userId, todoId)
}