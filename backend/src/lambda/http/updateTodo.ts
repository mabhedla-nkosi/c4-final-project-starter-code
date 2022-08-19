import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
//import { getUserId } from '../utils'
import {parseUserId} from "../../auth/utils"

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoInput = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      //helped by Tomasz Tarnowski on https://www.youtube.com/watch?v=yEJW4V7ddEQ&ab_channel=TomaszTarnowski
      console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    const user = parseUserId(jwtToken);
      //const user = getUserId(event)
      const todos = await docClient
        .get({
          TableName: process.env.TODOS_TABLE,
          Key: {
            todoId: todoInput,
            userId: user
          }
        })
        .promise()

      if (!todos.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "it doesn't exist" })
        }
      }

      const newItem = {
        userId: user,
        todoId: todoInput,
        name: updatedTodo.name,
        dueDate: updatedTodo.dueDate
      }

      await docClient
        .put({
          Table: process.env.TODOS_TABLE,
          Item: newItem
        })
        .promise()

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'updated' })
      }
    } catch (e) {
      return {
        statusCode: 404,
        body: JSON.stringify({ e })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
