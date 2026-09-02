import dns from 'dns/promises';

/**
 * Checks if an IPv4 or IPv6 address is in a blocked/internal range.
 * Blocks: RFC1918, Link-local, Loopback, Unique Local Addresses.
 * 
 * @param ip The IP address to check
 * @returns true if blocked, false if allowed
 */
export function isBlockedIP(ip: string): boolean {
  // IPv4 blocked ranges
  const ipv4Blocked = [
    /^127\./,                           // localhost
    /^10\./,                            // 10.0.0.0/8
    /^192\.168\./,                      // 192.168.0.0/16
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,   // 172.16.0.0/12
    /^169\.254\./,                      // Link-local (includes 169.254.169.254 cloud metadata)
    /^0\./,                             // 0.0.0.0/8
  ];

  if (ipv4Blocked.some(regex => regex.test(ip))) {
    return true;
  }

  // IPv6 blocked ranges
  const ipv6Blocked = [
    /^::1$/,                            // localhost
    /^fc00:/i,                          // Unique local address fc00::/7
    /^fd[0-9a-f]{2}:/i,
    /^fe80:/i,                          // Link-local
  ];

  if (ipv6Blocked.some(regex => regex.test(ip))) {
    return true;
  }

  return false;
}

/**
 * Checks if a hostname is explicitly blocked.
 * 
 * @param hostname The hostname to check
 * @returns true if blocked, false if allowed
 */
export function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (normalized === 'localhost' || normalized.endsWith('.localhost') || normalized.endsWith('.local')) {
    return true;
  }
  return false;
}

/**
 * Validates a URL to ensure it does not point to internal infrastructure (SSRF protection).
 * Resolves the DNS to check the actual target IP.
 * 
 * @param urlStr The URL to validate
 * @returns Object indicating if allowed, and a reason if not.
 */
export async function validateUrl(urlStr: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const parsed = new URL(urlStr);
    
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { allowed: false, reason: 'Only HTTP and HTTPS protocols are allowed' };
    }

    if (isBlockedHostname(parsed.hostname)) {
      return { allowed: false, reason: 'Blocked hostname' };
    }

    if (isBlockedIP(parsed.hostname)) {
      return { allowed: false, reason: 'Blocked IP address' };
    }

    // Resolve DNS to catch domains pointing to internal IPs
    try {
      const addresses = await dns.resolve(parsed.hostname);
      for (const ip of addresses) {
        if (typeof ip === 'string' && isBlockedIP(ip)) {
          return { allowed: false, reason: 'Domain resolves to a blocked IP address' };
        }
      }
    } catch (e) {
      // If DNS resolution fails, it might be an invalid domain.
      // We block it to be safe.
      return { allowed: false, reason: 'DNS resolution failed' };
    }

    return { allowed: true };
  } catch (error) {
    return { allowed: false, reason: 'Invalid URL format' };
  }
}
