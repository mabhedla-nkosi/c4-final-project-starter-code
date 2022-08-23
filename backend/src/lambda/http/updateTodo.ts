import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'

export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      // const todoInput = event.pathParameters.todoId
      // const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      //helped by Tomasz Tarnowski on https://www.youtube.com/watch?v=yEJW4V7ddEQ&ab_channel=TomaszTarnowski
      console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];     

    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  
    const toDoItem = await updateTodo(updatedTodo, todoId, jwtToken);

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({"updated": toDoItem})
      }
    } catch (e) {
      return {
        statusCode: 404,
        body: JSON.stringify({ e })
      }
    }
  }
