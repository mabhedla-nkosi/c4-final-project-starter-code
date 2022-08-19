import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JSONWebKeys } from '../auth/JSONWeb'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-86kma4gr.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  logger.info(event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  logger.info('Verifying a token')
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  //received help from havt3l
  try {
    const cert = await getCertificate(jwt.header.kid)
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  } catch (e) {
    throw new Error(e)
  }
    
}

//received help from havt3l
async function getCertificate(outerKid: string): Promise<string> {
  try {
    logger.info('Getting a certificate')
    const jdata = await Axios.get(jwksUrl)
    const moreData: JSONWebKeys = jdata.data
    const keys = moreData.keys

    if (!keys || keys.length < 1)
      throw new Error('Certificate could not be generated')
    const sKey = keys.find((key) => key.kid === outerKid)
    if (!sKey) throw new Error('Unable to find a signing key that matches')
    let cert = sKey.x5c[0]

    cert = cert.match(/.{1,64}/g).join('\n')
    if (cert) {
      cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
    } else {
      throw new Error(`Full certificate could not be generated ` + cert)
    }


    return cert
  } catch (e) {
    throw new Error(e)
  }
}

function getToken(authHeader: string): string {
  logger.info('Authorizing header', authHeader)
  logger.info(authHeader)
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
