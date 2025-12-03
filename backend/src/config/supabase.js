const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClientInstance = null;

function validateConfig() {
    const errors = [];

    if (!SUPABASE_URL) {
        errors.push('SUPABASE_URL is required');
    } else {
        try {
            new URL(SUPABASE_URL);
        } catch {
            errors.push('SUPABASE_URL must be a valid URL');
        }
    }

    if (!SUPABASE_ANON_KEY) {
        errors.push('SUPABASE_ANON_KEY is required');
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
        errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    if (errors.length > 0) {
        throw new Error(`Supabase configuration errors:\n${errors.join('\n')}`);
    }
}

function getAdminClient() {
    if (adminClientInstance) {
        return adminClientInstance;
    }

    validateConfig();

    adminClientInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        },
        realtime: {
            params: {
                eventsPerSecond: 0
            }
        }
    });

    console.log('[Supabase] Admin client initialized');
    return adminClientInstance;
}

function createUserClient(accessToken) {
    validateConfig();

    if (!accessToken) {
        throw new Error('Access token is required for user client');
    }

    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        },
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
}

function getAnonClient() {
    validateConfig();

    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    });
}

function getPublicConfig() {
    return {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY
    };
}

async function testConnection() {
    try {
        const client = getAdminClient();
        
        const { data, error } = await client
            .from('bucket_configurations')
            .select('count', { count: 'exact', head: true });

        if (error) {
            const { error: authError } = await client.auth.getSession();
            if (authError) {
                return { 
                    success: false, 
                    error: 'Failed to connect to Supabase Auth' 
                };
            }
        }

        return { success: true, message: 'Connection successful' };
    } catch (error) {
        return { 
            success: false, 
            error: error.message 
        };
    }
}

function clearAdminClient() {
    adminClientInstance = null;
}

module.exports = {
    getAdminClient,
    createUserClient,
    getAnonClient,
    getPublicConfig,
    testConnection,
    validateConfig,
    clearAdminClient,
    SUPABASE_URL
};
