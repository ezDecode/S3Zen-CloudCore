// Quick test script to debug URL validation
const { isSafeUrl } = require('./src/utils/validateUrl');

// Test with a sample AWS S3 presigned URL
const testUrls = [
    'https://my-bucket.s3.us-east-1.amazonaws.com/file.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=test',
    'https://my-bucket.s3.amazonaws.com/file.jpg',
    'http://localhost:3000/test',
    'https://example.com',
];

console.log('Testing URL validation:\n');

testUrls.forEach(url => {
    const result = isSafeUrl(url);
    console.log(`${result ? '✅' : '❌'} ${url.substring(0, 80)}`);
    console.log('');
});
