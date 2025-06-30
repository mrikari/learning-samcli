const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// SAMテンプレートからスタック名を取得
const samConfigPath = path.resolve(__dirname, '../../backend/samconfig.toml');
if (!fs.existsSync(samConfigPath)) {
  console.error('❌ samconfig.toml not found at:', samConfigPath);
  process.exit(1);
}

console.log('📄 Reading samconfig.toml...');
const samConfig = fs.readFileSync(samConfigPath, 'utf8');
const stackNameMatch = samConfig.match(/stack_name\s*=\s*"([^"]+)"/);
if (!stackNameMatch) {
  console.error('❌ Stack name not found in samconfig.toml');
  process.exit(1);
}
const stackName = stackNameMatch[1];
console.log(`📦 Stack name: ${stackName}`);

// CloudFormationスタックからS3バケット名を取得
try {
  console.log('🔍 Getting S3 bucket name from CloudFormation...');
  const output = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text`).toString().trim();
  if (!output || output === 'None') {
    console.error('❌ S3 bucket name not found in stack outputs');
    console.log('💡 Make sure the stack is deployed and has BucketName output');
    process.exit(1);
  }
  const bucketName = output;
  console.log(`🪣 S3 bucket: ${bucketName}`);

  // Next.jsのビルド出力ディレクトリ
  const buildDir = path.join(__dirname, '../out');
  
  // ビルド出力ディレクトリの存在確認
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build output directory not found:', buildDir);
    console.log('💡 Run "npm run build" first to generate the output directory');
    process.exit(1);
  }

  // S3にアップロード
  console.log('🚀 Uploading to S3...');
  console.log(`   Source: ${buildDir}`);
  console.log(`   Destination: s3://${bucketName}`);
  
  execSync(`aws s3 sync "${buildDir}" s3://${bucketName} --delete`, { stdio: 'inherit' });
  
  console.log('✅ Upload completed successfully!');
  
  // CloudFront Distribution IDを取得してキャッシュ無効化
  try {
    console.log('🔄 Creating CloudFront cache invalidation...');
    const distributionId = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Resources[?LogicalResourceId=='CloudFrontDistribution'].PhysicalResourceId" --output text`).toString().trim();
    
    if (!distributionId || distributionId === 'None') {
      console.log('ℹ️  CloudFront distribution not found, skipping cache invalidation');
    } else {
      console.log(`🆔 Distribution ID: ${distributionId}`);
      
      // CloudFrontキャッシュ無効化を作成
      const invalidationOutput = execSync(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`).toString();
      const invalidationData = JSON.parse(invalidationOutput);
      const invalidationId = invalidationData.Invalidation.Id;
      
      console.log(`🗑️  Cache invalidation created: ${invalidationId}`);
      console.log('⏳ Cache invalidation in progress... (this may take a few minutes)');
    }
  } catch (error) {
    console.log('⚠️  Warning: Failed to create CloudFront cache invalidation');
    console.log('   This is not critical - your files are uploaded successfully');
    console.log('   You can manually invalidate the cache in the AWS Console if needed');
  }
  
  // CloudFrontドメイン名も取得して表示
  try {
    const cloudFrontDomain = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text`).toString().trim();
    if (cloudFrontDomain && cloudFrontDomain !== 'None') {
      console.log(`🌐 CloudFront URL: https://${cloudFrontDomain}`);
      console.log('💡 It may take a few minutes for changes to appear due to CloudFront caching');
    }
  } catch (error) {
    // CloudFrontドメインの取得に失敗しても、デプロイは成功とする
    console.log('ℹ️  CloudFront domain not available');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   - Make sure AWS CLI is configured and authenticated');
  console.log('   - Verify the CloudFormation stack is deployed');
  console.log('   - Check if you have the necessary AWS permissions');
  process.exit(1);
} 