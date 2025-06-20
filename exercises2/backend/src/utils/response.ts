import { APIGatewayProxyResult } from 'aws-lambda';

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const createResponse = (
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(
    statusCode,
    { message },
    headers
  );
}; 