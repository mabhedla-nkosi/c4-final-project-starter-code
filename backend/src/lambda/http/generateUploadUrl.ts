import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
const AWS = require('aws-sdk')
//const docClient = new AWS.DynamoDB.DocumentClient()

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    try {
      const s3 = new AWS.S3({
        signatureVersion: 'v4'
      })
      const presignedUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
      })

      return presignedUrl
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

// const todoInput = event.pathParameters.todoId
// const user = getUserId(event)
// const todos = await docClient
//   .get({
//     TableName: process.env.TODOS_TABLE,
//     Key: {
//       todoId: todoInput,
//       userId: user
//     }
//   })
//   .promise()

// if (!todos.Item) {
//   return {
//     statusCode: 404,
//     headers: {
//       'Access-Control-Allow-Origin': '*'
//     },
//     body: JSON.stringify({ error: "it doesn't exist" })
//   }
// }
