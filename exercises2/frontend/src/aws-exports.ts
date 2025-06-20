const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: 'TroublesServiceApi',
        endpoint: process.env.REACT_APP_API_ENDPOINT,
      },
    ],
  },
};

export default awsConfig; 