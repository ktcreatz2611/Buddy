export const SECRET_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9]{20,}/g,           // OpenAI keys
  /\b[A-Z0-9]{20}:[A-Za-z0-9+/=]{40}\b/g, // AWS keys
  /\b(?:\d[ -]*?){13,16}\b/g,       // Credit cards
  /\b\d{3}-\d{2}-\d{4}\b/g,         // SSN
  /password\s*[:=]\s*\S+/gi,        // password assignments
  /Bearer\s+[A-Za-z0-9._~+/-]+=*/g, // Bearer tokens
  /ghp_[A-Za-z0-9_]{36,}/g,         // GitHub PATs
  /xoxb-[A-Za-z0-9-]+/g,            // Slack tokens
];

/**
 * Checks if the text contains any matching secret patterns
 */
export function containsSecret(text: string): boolean {
  if (!text) return false;
  return SECRET_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0; // reset state
    return pattern.test(text);
  });
}

/**
 * Redacts secrets in the text by replacing them with [REDACTED]
 */
export function redactSecrets(text: string): string {
  if (!text) return text;
  let redacted = text;
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0; // reset state
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

/**
 * Heuristic to detect if a key-value pair is secret-like
 */
export function isSecretLike(key: string, value: unknown): boolean {
  const normalizedKey = key.toLowerCase();
  if (normalizedKey.includes('secret') || 
      normalizedKey.includes('password') || 
      normalizedKey.includes('token') || 
      normalizedKey.includes('key')) {
    return true;
  }
  
  if (typeof value === 'string' && containsSecret(value)) {
    return true;
  }
  
  if (typeof value === 'object' && value !== null) {
    return containsSecret(JSON.stringify(value));
  }
  
  return false;
}
