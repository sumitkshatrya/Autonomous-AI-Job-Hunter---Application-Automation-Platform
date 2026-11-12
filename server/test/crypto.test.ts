import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hashString } from '../src/utils/crypto';

describe('Crypto & Security Utilities', () => {
  it('should encrypt and decrypt sensitive tokens symmetrically using AES-256-GCM', () => {
    const secretToken = 'ya29.a0AfH6SMD_very_secret_oauth_refresh_token_2026';
    const encrypted = encrypt(secretToken);

    expect(encrypted).not.toBe(secretToken);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(secretToken);
  });

  it('should produce identical SHA-256 content hashes for identical job strings', () => {
    const jobA = 'Stripe|Senior Staff Engineer|San Francisco, CA|https://stripe.com/jobs/1';
    const jobB = 'stripe|senior staff engineer|san francisco, ca|https://stripe.com/jobs/1';

    const hashA = hashString(jobA);
    const hashB = hashString(jobB);

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64); // SHA-256 hex string length
  });
});
