/**
 * Mock File Service
 * Simulates S3 uploads in local/mock mode
 */

export const mockFileService = {
    upload: async (file, options = {}) => {
        const { onProgress } = options;

        // Simulate progress
        if (onProgress) {
            for (let i = 0; i <= 100; i += 20) {
                onProgress({ percentage: i, loaded: i, total: 100 });
                await new Promise(r => setTimeout(r, 200));
            }
        }

        // Return a mock result
        return {
            success: true,
            file: {
                key: `local-mock/${Date.now()}-${file.name}`,
                originalName: file.name,
                size: file.size,
                originalSize: file.size,
                type: file.type,
                compressed: false,
                url: URL.createObjectURL(file), // Local preview URL
                s3Bucket: 'mock-bucket',
                s3Region: 'mock-region',
            }
        };
    },

    delete: async (keys) => {
        return { success: true, deleted: keys, failed: [] };
    }
};
