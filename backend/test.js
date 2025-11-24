// Simple test script for the URL shortener
const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Test 1: Create a short URL
function testShorten() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            longUrl: 'https://github.com/example/very-long-repository-name'
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/shorten',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(body);
                    console.log('✓ Short URL created:', result);
                    resolve(result);
                } else {
                    console.error('✗ Failed to create short URL:', body);
                    reject(new Error(body));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Test 2: Test redirect
function testRedirect(shortCode) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/s/${shortCode}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 302) {
                console.log('✓ Redirect works! Location:', res.headers.location);
                resolve(res.headers.location);
            } else {
                console.error('✗ Redirect failed with status:', res.statusCode);
                reject(new Error('Redirect failed'));
            }
        });

        req.on('error', reject);
        req.end();
    });
}

// Test 3: Invalid URL
function testInvalidUrl() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            longUrl: 'http://localhost:8080/test'
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/shorten',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 400) {
                    console.log('✓ Invalid URL rejected correctly:', body);
                    resolve();
                } else {
                    console.error('✗ Should have rejected localhost URL');
                    reject(new Error('Validation failed'));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Run tests
async function runTests() {
    console.log('Starting URL Shortener Tests...\n');
    
    try {
        // Test 1
        console.log('Test 1: Create short URL');
        const result = await testShorten();
        
        // Test 2
        console.log('\nTest 2: Test redirect');
        await testRedirect(result.shortCode);
        
        // Test 3
        console.log('\nTest 3: Reject invalid URL');
        await testInvalidUrl();
        
        console.log('\n✓ All tests passed!');
    } catch (error) {
        console.error('\n✗ Test failed:', error.message);
        process.exit(1);
    }
}

runTests();
