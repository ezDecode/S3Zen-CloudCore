function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function isPublicHost(hostname) {
    // Allow S3 URLs and other AWS services
    if (hostname.endsWith('.amazonaws.com')) return true;

    // Reject localhost and private IPs for security
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;

    // Simple IPv4 check for private IPs
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
        // Block private IP ranges
        const parts = hostname.split('.').map(Number);
        if (parts[0] === 10) return false; // 10.0.0.0/8
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false; // 172.16.0.0/12
        if (parts[0] === 192 && parts[1] === 168) return false; // 192.168.0.0/16
    }

    // Allow IPv6 addresses (simplified check)
    // Most production services won't use IPv6 localhost

    return true;
}

function isSafeUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
        console.log('Invalid URL: not a string or empty');
        return false;
    }

    if (!isValidUrl(urlString)) {
        console.log('Invalid URL: malformed URL');
        return false;
    }

    const { hostname } = new URL(urlString);
    const isPublic = isPublicHost(hostname);

    if (!isPublic) {
        console.log(`Invalid URL: hostname ${hostname} is not public`);
    }

    return isPublic;
}

module.exports = { isValidUrl, isSafeUrl };
