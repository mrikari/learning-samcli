const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// バックエンドのsamconfig.tomlを読み込む
const samConfigPath = path.resolve(__dirname, '../../backend/samconfig.toml');
const samConfig = fs.readFileSync(samConfigPath, 'utf8');

// スタック名を取得
const stackNameMatch = samConfig.match(/stack_name = "([^"]+)"/);
if (!stackNameMatch) {
  console.error('Error: Could not find stack_name in samconfig.toml');
  process.exit(1);
}
const stackName = stackNameMatch[1];

// CloudFormationスタックの出力を取得
const outputs = JSON.parse(execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs"`).toString());

// 環境変数を設定
const envVars = {
  NEXT_PUBLIC_COGNITO_REGION: process.env.AWS_REGION || 'ap-northeast-1',
  NEXT_PUBLIC_COGNITO_USER_POOL_ID: outputs.find(o => o.OutputKey === 'CognitoUserPoolId')?.OutputValue,
  NEXT_PUBLIC_COGNITO_CLIENT_ID: outputs.find(o => o.OutputKey === 'CognitoClientId')?.OutputValue,
  NEXT_PUBLIC_API_ENDPOINT: outputs.find(o => o.OutputKey === 'TroublesServiceApiEndpoint')?.OutputValue,
  NEXT_PUBLIC_S3_BUCKET: outputs.find(o => o.OutputKey === 'FrontendBucketName')?.OutputValue,
  NEXT_PUBLIC_CLOUDFRONT_DOMAIN: outputs.find(o => o.OutputKey === 'CloudFrontDomainName')?.OutputValue,
};

// .env.localファイルを作成
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.resolve(__dirname, '../.env.local'), envContent);
console.log('Environment variables have been written to .env.local'); 