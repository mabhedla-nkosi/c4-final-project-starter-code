import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { deleteTodo } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
const AWS = require('aws-sdk')
import {parseUserId} from "../../auth/utils";

const docClient = new AWS.DynamoDB.DocumentClient()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoInput = event.pathParameters.todoId
      // TODO: Remove a TODO item by id
      //helped by Tomasz Tarnowski on https://www.youtube.com/watch?v=yEJW4V7ddEQ&ab_channel=TomaszTarnowski
      //const user = getUserId(event)
      console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    const user = parseUserId(jwtToken);
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

      await docClient
        .delete({
          TableName: process.env.TODOS_TABLE,
          Key: {
            todoId: todoInput,
            userId: user
          }
        })
        .promise()

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Record deleted' })
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
