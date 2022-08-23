import { todosAcess } from '../dataLayer/todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
import {parseUserId} from "../auth/utils"
import {TodoUpdate} from "../models/TodoUpdate"


// TODO: Implement businessLogic
const uuidv4 = require('uuid/v4')
const toDoAccess = new todosAcess()
const logger = createLogger('TodosAccess')

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {
    logger.info('Get Todo')
    const userId = parseUserId(jwtToken)
    return toDoAccess.getTodosForUser(userId)
}

export function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    logger.info('Create Todo')
    const userId = parseUserId(jwtToken)
    const todoId =  uuidv4()
    const bucketName = process.env.S3_BUCKET_NAME
    
    return toDoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${bucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    })
}

export function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    logger.info('Update todo')
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export function deleteTodo(todoId: string, jwtToken: string): Promise<string> {
    logger.info('Delete todo')
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteTodo(todoId, userId)
}

export function presignedUrl(todoId: string): Promise<string> {
    logger.info('Presigned url')
    return toDoAccess.presignedUrl(todoId)
}