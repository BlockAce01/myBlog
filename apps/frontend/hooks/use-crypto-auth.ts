import { useState, useCallback } from 'react';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

interface ChallengeResponse {
  challenge: string;
  userId: string;
}

interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const useCryptoAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate ECDSA P-256 key pair using Web Crypto API
  const generateKeyPair = useCallback(async (): Promise<KeyPair | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate key pair
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true, // extractable
        ['sign', 'verify']
      );

      // Export public key
      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

      // Export private key
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

      // Store private key securely in IndexedDB
      await storePrivateKey(privateKey);

      return {
        publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`
      };
    } catch (err) {
      console.error('Key generation error:', err);
      setError('Failed to generate cryptographic keys');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Store private key in IndexedDB
  const storePrivateKey = async (privateKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CryptoAuthDB', 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['keys'], 'readwrite');
        const store = transaction.objectStore('keys');
        const putRequest = store.put({ id: 'admin-private-key', key: privateKey });

        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
    });
  };

  // Retrieve private key from IndexedDB
  const getPrivateKey = async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CryptoAuthDB', 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['keys'], 'readonly');
        const store = transaction.objectStore('keys');
        const getRequest = store.get('admin-private-key');

        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? result.key : null);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
    });
  };

  // Import private key for signing
  const importPrivateKey = async (pemKey: string): Promise<CryptoKey> => {
    // Remove PEM headers and decode base64
    const pemContents = pemKey
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');

    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    return crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['sign']
    );
  };

  // Convert raw ECDSA signature to DER format
  const rawSignatureToDER = (rawSignature: Uint8Array): Uint8Array => {
    // ECDSA P-256 signature is r || s, each 32 bytes
    const r = rawSignature.slice(0, 32);
    const s = rawSignature.slice(32, 64);

    // Convert to big integers and encode as DER integers
    const encodeDERInteger = (bytes: Uint8Array): Uint8Array => {
      // Remove leading zeros
      let start = 0;
      while (start < bytes.length - 1 && bytes[start] === 0) {
        start++;
      }
      const trimmed = bytes.slice(start);

      // If high bit is set, add leading zero to make it positive
      if (trimmed[0] & 0x80) {
        return new Uint8Array([0, ...trimmed]);
      }
      return trimmed;
    };

    const rEncoded = encodeDERInteger(r);
    const sEncoded = encodeDERInteger(s);

    const rLength = rEncoded.length;
    const sLength = sEncoded.length;
    const contentLength = 2 + rLength + 2 + sLength; // 2 for r tag/length + r + 2 for s tag/length + s

    const der = new Uint8Array(2 + contentLength);
    der[0] = 0x30; // SEQUENCE
    der[1] = contentLength;
    der[2] = 0x02; // INTEGER for r
    der[3] = rLength;
    der.set(rEncoded, 4);
    der[4 + rLength] = 0x02; // INTEGER for s
    der[5 + rLength] = sLength;
    der.set(sEncoded, 6 + rLength);

    return der;
  };

  // Sign challenge with private key
  const signChallenge = async (challenge: string): Promise<string | null> => {
    try {
      const privateKeyPem = await getPrivateKey();
      if (!privateKeyPem) {
        throw new Error('No private key found');
      }

      const privateKey = await importPrivateKey(privateKeyPem);

      // Convert challenge to Uint8Array
      const challengeBytes = new TextEncoder().encode(challenge);

      // Sign the challenge
      const rawSignature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: 'SHA-256',
        },
        privateKey,
        challengeBytes
      );

      // Convert raw signature to DER format
      const derSignature = rawSignatureToDER(new Uint8Array(rawSignature));

      // Convert to hex string
      return Array.from(derSignature)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    } catch (err) {
      console.error('Signing error:', err);
      setError('Failed to sign challenge');
      return null;
    }
  };

  // Get authentication challenge from server
  const getChallenge = async (email: string): Promise<ChallengeResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get challenge');
      }

      return await response.json();
    } catch (err) {
      console.error('Challenge request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get authentication challenge');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify signature and authenticate
  const authenticate = async (challenge: string, signature: string, userId: string): Promise<AuthResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge,
          signature,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Export private key for backup
  const exportPrivateKey = async (): Promise<string | null> => {
    try {
      const privateKey = await getPrivateKey();
      return privateKey;
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export private key');
      return null;
    }
  };

  // Import private key from backup
  const importPrivateKeyFromBackup = async (pemKey: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate the key format
      if (!pemKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private key format');
      }

      // Store the imported key
      await storePrivateKey(pemKey);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import private key');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if private key exists
  const hasPrivateKey = async (): Promise<boolean> => {
    try {
      const key = await getPrivateKey();
      return key !== null;
    } catch {
      return false;
    }
  };

  return {
    isLoading,
    error,
    generateKeyPair,
    signChallenge,
    getChallenge,
    authenticate,
    exportPrivateKey,
    importPrivateKeyFromBackup,
    hasPrivateKey,
  };
};
