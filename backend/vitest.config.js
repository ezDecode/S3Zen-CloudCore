import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Test environment
        environment: 'node',
        
        // Test file patterns
        include: ['tests/**/*.test.js'],
        
        // Exclude patterns
        exclude: ['node_modules', 'dist'],
        
        // Global test timeout
        testTimeout: 10000,
        
        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.js'],
            exclude: [
                'src/**/*.test.js',
                'node_modules'
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 60,
                statements: 70
            }
        },
        
        // Reporter configuration
        reporters: ['default'],
        
        // Parallel execution
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false
            }
        },
        
        // Setup files
        setupFiles: ['./tests/setup.js'],
        
        // Global setup (environment variables)
        env: {
            NODE_ENV: 'test',
            ENCRYPTION_KEY: 'a'.repeat(64),
            SUPABASE_URL: 'https://test-project.supabase.co',
            SUPABASE_ANON_KEY: 'test-anon-key',
            SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
        }
    }
});
