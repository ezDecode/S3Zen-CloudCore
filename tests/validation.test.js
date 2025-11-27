/**
 * Unit Tests for Validation Utils - buildS3Key and sanitization
 */

import {
    sanitizeFileName,
    sanitizeS3Path,
    normalizeKey,
    isDangerousPath,
    validateKey,
    buildS3Key,
    isValidFileSize
} from '../src/utils/validationUtils.js';

// Test suite for buildS3Key
console.log('=== Testing buildS3Key() ===');

const testCases = [
    // [folderPath, filename, expected]
    ['', 'file.txt', 'file.txt'],
    ['images', 'photo.jpg', 'images/photo.jpg'],
    ['images/', 'photo.jpg', 'images/photo.jpg'],
    ['a/b/c', 'file.txt', 'a/b/c/file.txt'],
    ['a/b/c/', 'file.txt', 'a/b/c/file.txt'],
    [null, 'file.txt', 'file.txt'],
    ['', '', ''],
    ['folder', '', ''],
    ['/', 'file.txt', 'file.txt'],
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach(([folderPath, filename, expected], index) => {
    const result = buildS3Key(folderPath, filename);
    const status = result === expected ? '✓' : '✗';
    if (result === expected) {
        passedTests++;
    } else {
        failedTests++;
    }
    console.log(`${status} Test ${index + 1}: buildS3Key(${JSON.stringify(folderPath)}, ${JSON.stringify(filename)}) = "${result}" ${result === expected ? '' : `(expected "${expected}")`}`);
});

// Test suite for sanitizeS3Path and validateKey
console.log('\n=== Testing sanitizeS3Path() and validateKey() ===');

const pathTests = [
    // [input, expectedSanitized, shouldBeDangerous]
    ['images/photo.jpg', 'images/photo.jpg', false],
    ['images/', 'images/', false], // FIXED: Preserve trailing slash
    ['../../../etc/passwd', 'etc/passwd', false], // Path traversal removed by sanitization - now valid
    ['normal/path/file.txt', 'normal/path/file.txt', false],
    ['path//double//slash', 'path/double/slash', false],
    ['path/with/..', 'path/with', false], // .. removed by sanitization - now valid
    ['test.jpg', 'test.jpg', false],
    ['<script>alert(1)</script>', '<script>alert(1)</script>', false], // XSS - not dangerous for S3 keys
    ['file\x00name.txt', 'filename.txt', false], // Null byte removed by sanitization - now valid
    ['a/b/c/file.pdf', 'a/b/c/file.pdf', false],
    ['folder/', 'folder/', false], // FIXED: Preserve trailing slash for folders
    ['a/b/c/', 'a/b/c/', false], // FIXED: Preserve nested folder trailing slash
];

pathTests.forEach(([input, expectedSanitized, shouldBeDangerous], index) => {
    const sanitized = sanitizeS3Path(input);
    const dangerous = validateKey(sanitized); // Use validateKey on SANITIZED path
    const sanitizedCorrect = sanitized === expectedSanitized;
    const dangerousCorrect = dangerous === shouldBeDangerous;

    const status = (sanitizedCorrect && dangerousCorrect) ? '✓' : '✗';
    if (sanitizedCorrect && dangerousCorrect) {
        passedTests++;
    } else {
        failedTests++;
    }

    console.log(`${status} Test ${index + 1}:`);
    console.log(`   Input: "${input}"`);
    console.log(`   Sanitized: "${sanitized}" ${sanitizedCorrect ? '✓' : `✗ (expected "${expectedSanitized}")`}`);
    console.log(`   Dangerous: ${dangerous} ${dangerousCorrect ? '✓' : `✗ (expected ${shouldBeDangerous})`}`);
});

// Test suite for validateKey specifically
console.log('\n=== Testing validateKey() Specifically ===');

const validateKeyTests = [
    // [sanitizedKey, shouldBeInvalid, description]
    ['normal/path/file.txt', false, 'Normal path'],
    ['folder/', false, 'Folder with trailing slash'],
    ['a/b/c/', false, 'Nested folder with trailing slash'],
    ['file..txt', true, 'Contains .. (path traversal)'],
    ['path/../file', true, 'Contains ../ (path traversal)'],
    ['test%2e%2efile', true, 'Contains URL encoded ..'],
    ['test%2ffile', true, 'Contains URL encoded /'],
    ['test%5cfile', true, 'Contains URL encoded \\'],
    ['file\\name', true, 'Contains backslash'],
    ['filename.txt', false, 'Valid filename'],
    ['', true, 'Empty string'],
];

validateKeyTests.forEach(([key, shouldBeInvalid, description], index) => {
    const result = validateKey(key);
    const correct = result === shouldBeInvalid;

    if (correct) {
        passedTests++;
    } else {
        failedTests++;
    }

    const status = correct ? '✓' : '✗';
    console.log(`${status} Test ${index + 1}: validateKey("${key}") = ${result} ${correct ? '✓' : `✗ (expected ${shouldBeInvalid})`} - ${description}`);
});

// Test suite for isValidFileSize
console.log('\n=== Testing isValidFileSize() ===');

const fileSizeTests = [
    [1024, true], // 1KB
    [1024 * 1024, true], // 1MB
    [100 * 1024 * 1024, true], // 100MB
    [5 * 1024 * 1024 * 1024, true], // 5GB (max)
    [6 * 1024 * 1024 * 1024, false], // 6GB (over limit)
    [0, false], // Zero bytes
    [-1, false], // Negative
];

fileSizeTests.forEach(([size, expected], index) => {
    const result = isValidFileSize(size);
    const status = result === expected ? '✓' : '✗';
    if (result === expected) {
        passedTests++;
    } else {
        failedTests++;
    }
    console.log(`${status} Test ${index + 1}: isValidFileSize(${size}) = ${result} ${result === expected ? '' : `(expected ${expected})`}`);
});

// Summary
console.log(`\n=== Test Summary ===`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);

if (failedTests > 0) {
    process.exit(1);
} else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
}
