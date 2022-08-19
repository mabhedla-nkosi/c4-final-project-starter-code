import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
import {parseUserId} from "../../auth/utils"

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

// TODO: Get all TODO items for a current user
//helped by Tomasz Tarnowski on https://www.youtube.com/watch?v=yEJW4V7ddEQ&ab_channel=TomaszTarnowski
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try {
      console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    const user = parseUserId(jwtToken);
     // const user = getUserId(event)
      const todos = await docClient
        .query({
          TableName: process.env.TODOS_TABLE,
          Key: {
            userId: user
          }
        })
        .promise()

      if (!todos.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'not found' })
        }
      }
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ todos })
      }
    } catch (e) {}
  }
)
handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
