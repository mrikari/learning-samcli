const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// SAMテンプレートからスタック名を取得
const samConfigPath = path.resolve(__dirname, '../../backend/samconfig.toml');
if (!fs.existsSync(samConfigPath)) {
  console.error('samconfig.toml not found');
  process.exit(1);
}

const samConfig = fs.readFileSync(samConfigPath, 'utf8');
const stackNameMatch = samConfig.match(/stack_name\s*=\s*"([^"]+)"/);
if (!stackNameMatch) {
  console.error('Stack name not found in samconfig.toml');
  process.exit(1);
}
const stackName = stackNameMatch[1];

// CloudFormationスタックからS3バケット名を取得
try {
  const output = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text`).toString().trim();
  if (!output) {
    console.error('S3 bucket name not found in stack outputs');
    process.exit(1);
  }
  const bucketName = output;

  // Next.jsのビルド出力ディレクトリ
  const buildDir = path.join(__dirname, '../out');

  // S3にアップロード
  console.log(`Uploading to S3 bucket: ${bucketName}`);
  execSync(`aws s3 sync ${buildDir} s3://${bucketName} --delete`, { stdio: 'inherit' });
  console.log('Upload completed successfully');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 