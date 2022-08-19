import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
//import { getUserId } from '../utils'
//import { createTodo } from '../../businessLogic/todos'
import {parseUserId} from "../../auth/utils"

const uuid = require('uuid')

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()
const bucketName = process.env.IMAGES_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      // TODO: Implement creating a new TODO item
      //helped by Tomasz Tarnowski on https://www.youtube.com/watch?v=yEJW4V7ddEQ&ab_channel=TomaszTarnowski
      const todoId = uuid.v4()

      // const authorization=event.headers.Authorizing;
      // const split=authorization.split(' ');
      // const token=split[1];
      console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    const user = parseUserId(jwtToken);
     // const user = getUserId(event)

      const newItem = {
        userId: user,
        todoId: todoId,
        createdAt: new Date().getTime().toString(),
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.us-east-1.amazonaws.com/${todoId}` //not sure
      }

      await docClient
        .put({
          Table: process.env.TODOS_TABLE,
          Item: newItem
        })
        .promise()

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          newItem
        })
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
