#!/usr/bin/env node

/**
 * Build & Validation Script
 * Checks all requirements before deployment
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
    return `${colors.green}✓${colors.reset}`;
}

function crossmark() {
    return `${colors.red}✗${colors.reset}`;
}

function warning() {
    return `${colors.yellow}⚠${colors.reset}`;
}

// Track validation results
let errors = 0;
let warnings = 0;

/**
 * Check if a file exists
 */
function checkFileExists(filePath, description, required = true) {
    const exists = fs.existsSync(filePath);
    if (exists) {
        log(`${checkmark()} ${description}`, 'green');
        return true;
    } else {
        if (required) {
            log(`${crossmark()} ${description} - MISSING`, 'red');
            errors++;
        } else {
            log(`${warning()} ${description} - MISSING (optional)`, 'yellow');
            warnings++;
        }
        return false;
    }
}

/**
 * Check directory exists
 */
function checkDirectoryExists(dirPath, description) {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    if (exists) {
        log(`${checkmark()} ${description}`, 'green');
        return true;
    } else {
        log(`${crossmark()} ${description} - MISSING`, 'red');
        errors++;
        return false;
    }
}

/**
 * Check package.json dependencies
 */
function checkDependencies() {
    try {
        const packageJson = require('../package.json');
        const requiredDeps = ['express', 'cors', 'dotenv'];
        const optionalDeps = ['sqlite3', 'better-sqlite3', 'nanoid'];

        const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
        const missingOptional = optionalDeps.filter(dep => !packageJson.dependencies[dep]);

        if (missing.length === 0) {
            log(`${checkmark()} All required dependencies present`, 'green');
        } else {
            log(`${crossmark()} Missing dependencies: ${missing.join(', ')}`, 'red');
            errors++;
        }

        if (missingOptional.length > 0 && missingOptional.length < optionalDeps.length) {
            log(`${warning()} Some optional dependencies not installed: ${missingOptional.join(', ')}`, 'yellow');
            warnings++;
        }

        return missing.length === 0;
    } catch (error) {
        log(`${crossmark()} Could not read package.json: ${error.message}`, 'red');
        errors++;
        return false;
    }
}

/**
 * Check node_modules exists
 */
function checkNodeModules() {
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        log(`${checkmark()} node_modules installed`, 'green');
        return true;
    } else {
        log(`${crossmark()} node_modules not found - run 'npm install'`, 'red');
        errors++;
        return false;
    }
}

/**
 * Validate environment variables
 */
function checkEnvironmentVariables() {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

    const requiredVars = {
        'BASE_URL': 'Base URL for short links',
        'ADMIN_API_KEY': 'Admin API key for protected endpoints'
    };

    const optionalVars = {
        'PORT': 'Server port (defaults to 3000)',
        'DB_PATH': 'Database file path (defaults to ./data/urls.db)'
    };

    let allRequired = true;

    // Check required variables
    for (const [varName, description] of Object.entries(requiredVars)) {
        if (process.env[varName]) {
            log(`${checkmark()} ${varName}: ${description}`, 'green');
        } else {
            log(`${crossmark()} ${varName}: ${description} - NOT SET`, 'red');
            errors++;
            allRequired = false;
        }
    }

    // Check optional variables
    for (const [varName, description] of Object.entries(optionalVars)) {
        if (process.env[varName]) {
            log(`${checkmark()} ${varName}: ${description}`, 'green');
        } else {
            log(`${warning()} ${varName}: ${description} - using default`, 'yellow');
            warnings++;
        }
    }

    return allRequired;
}

/**
 * Check database directory and file
 */
function checkDatabase() {
    const dataDir = path.join(__dirname, '..', 'data');
    const dbPath = path.join(dataDir, 'urls.db');

    // Check if data directory exists, create if not
    if (!fs.existsSync(dataDir)) {
        try {
            fs.mkdirSync(dataDir, { recursive: true });
            log(`${checkmark()} Created data directory`, 'green');
        } catch (error) {
            log(`${crossmark()} Could not create data directory: ${error.message}`, 'red');
            errors++;
            return false;
        }
    } else {
        log(`${checkmark()} Data directory exists`, 'green');
    }

    // Check if database file exists
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        log(`${checkmark()} Database file exists (${(stats.size / 1024).toFixed(2)} KB)`, 'green');
    } else {
        log(`${warning()} Database file will be created on first run`, 'yellow');
        warnings++;
    }

    return true;
}

/**
 * Validate source code structure
 */
function checkSourceStructure() {
    const requiredFiles = [
        { path: 'src/server.js', desc: 'Main server file' },
        { path: 'src/routes/shortener.js', desc: 'Shortener routes' }
    ];

    const optionalFiles = [
        { path: 'src/db.js', desc: 'Database initialization (optional)' }
    ];

    let allPresent = true;

    for (const file of requiredFiles) {
        const fullPath = path.join(__dirname, '..', file.path);
        if (!checkFileExists(fullPath, file.desc, true)) {
            allPresent = false;
        }
    }

    for (const file of optionalFiles) {
        const fullPath = path.join(__dirname, '..', file.path);
        checkFileExists(fullPath, file.desc, false);
    }

    return allPresent;
}

/**
 * Check for .env.example
 */
function checkEnvExample() {
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    checkFileExists(envExamplePath, '.env.example file (for reference)', false);
}

/**
 * Validate routes file
 */
function validateRoutes() {
    try {
        const routesPath = path.join(__dirname, '..', 'src', 'routes', 'shortener.js');
        const routesContent = fs.readFileSync(routesPath, 'utf8');

        const requiredRoutes = ['POST /shorten', 'GET /s/:code'];
        const optionalRoutes = ['GET /stats'];
        const foundRoutes = [];

        if (routesContent.includes('router.post') && routesContent.includes('/shorten')) {
            foundRoutes.push('POST /shorten');
        }
        if (routesContent.includes('router.get') && routesContent.includes('/s/:code')) {
            foundRoutes.push('GET /s/:code');
        }
        if (routesContent.includes('router.get') && routesContent.includes('/stats')) {
            foundRoutes.push('GET /stats');
        }

        const missingRequired = requiredRoutes.filter(r => !foundRoutes.includes(r));
        if (missingRequired.length > 0) {
            log(`${crossmark()} Missing required routes: ${missingRequired.join(', ')}`, 'red');
            errors++;
            return false;
        }

        const missingOptional = optionalRoutes.filter(r => !foundRoutes.includes(r));
        if (missingOptional.length > 0) {
            log(`${warning()} Optional routes not implemented: ${missingOptional.join(', ')}`, 'yellow');
            warnings++;
        }

        log(`${checkmark()} All required routes defined`, 'green');
        return true;
    } catch (error) {
        log(`${crossmark()} Could not validate routes: ${error.message}`, 'red');
        errors++;
        return false;
    }
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.split('.')[0].substring(1));

    if (major >= 18) {
        log(`${checkmark()} Node.js version: ${nodeVersion} (≥18 required)`, 'green');
        return true;
    } else {
        log(`${crossmark()} Node.js version: ${nodeVersion} - version 18+ required`, 'red');
        errors++;
        return false;
    }
}

/**
 * Main build validation
 */
async function runBuildChecks() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║   CloudCore Backend - Build Validation    ║', 'cyan');
    log('╚════════════════════════════════════════════╝\n', 'cyan');

    // 1. Check Node.js version
    log('📌 Checking Node.js Version...', 'blue');
    checkNodeVersion();
    console.log();

    // 2. Check file structure
    log('📁 Checking File Structure...', 'blue');
    checkFileExists(path.join(__dirname, '..', 'package.json'), 'package.json', true);
    checkFileExists(path.join(__dirname, '..', '.env'), '.env file', true);
    checkEnvExample();
    console.log();

    // 3. Check source code structure
    log('🔧 Checking Source Code Structure...', 'blue');
    checkSourceStructure();
    console.log();

    // 4. Check dependencies
    log('📦 Checking Dependencies...', 'blue');
    checkDependencies();
    checkNodeModules();
    console.log();

    // 5. Check environment variables
    log('🔐 Checking Environment Variables...', 'blue');
    checkEnvironmentVariables();
    console.log();

    // 6. Check database
    log('💾 Checking Database Setup...', 'blue');
    checkDatabase();
    console.log();

    // 7. Validate routes
    log('🛣️  Validating Routes...', 'blue');
    validateRoutes();
    console.log();

    // 8. Summary
    log('═══════════════════════════════════════════', 'cyan');
    log('                  SUMMARY                   ', 'cyan');
    log('═══════════════════════════════════════════', 'cyan');

    if (errors === 0 && warnings === 0) {
        log(`\n${checkmark()} ALL CHECKS PASSED! Ready for deployment! 🚀\n`, 'green');
        process.exit(0);
    } else {
        if (errors > 0) {
            log(`\n${crossmark()} ${errors} ERROR(S) FOUND`, 'red');
        }
        if (warnings > 0) {
            log(`${warning()} ${warnings} WARNING(S)`, 'yellow');
        }

        if (errors > 0) {
            log('\n❌ Build validation FAILED. Please fix errors above.\n', 'red');
            process.exit(1);
        } else {
            log('\n⚠️  Build validation completed with warnings.\n', 'yellow');
            process.exit(0);
        }
    }
}

// Run the build checks
runBuildChecks().catch(error => {
    log(`\n${crossmark()} Build validation failed with error: ${error.message}\n`, 'red');
    process.exit(1);
});
