function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function isPublicHost(hostname) {
    // Reject localhost and IP addresses
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
    // Simple IPv4 check
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) return false;
    // Simple IPv6 check (contains ':')
    if (hostname.includes(':')) return false;
    return true;
}

function isSafeUrl(urlString) {
    if (!isValidUrl(urlString)) return false;
    const { hostname } = new URL(urlString);
    return isPublicHost(hostname);
}

module.exports = { isValidUrl, isSafeUrl };
