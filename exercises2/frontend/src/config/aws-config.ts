import AWS from 'aws-sdk';

const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || '',
  },
};

AWS.config.update(awsConfig);

export const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.REACT_APP_AWS_REGION,
});

export const apiGateway = new AWS.APIGateway({
  region: process.env.REACT_APP_AWS_REGION,
});

export default awsConfig; 