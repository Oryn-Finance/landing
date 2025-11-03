import { sha256, toBytes } from "viem";

// Helper functions
export function with0x(str: string): `0x${string}` {
    if (str.startsWith("0x")) {
        return str as `0x${string}`;
    }
    return `0x${str}` as `0x${string}`;
}

export function trim0x(str: string): string {
    if (str.startsWith("0x")) {
        return str.slice(2);
    }
    return str;
}

export type SecretData = {
    secret: `0x${string}`;
    secretHash: `0x${string}`;
    nonce: string;
    orderId: string;
};

// Generate secret from signature
export async function generateSecret(
    nonce: string,
    signature: `0x${string}`
): Promise<{ secret: `0x${string}`; secretHash: `0x${string}` }> {
    // The secret is SHA256 of the signature
    const secret = with0x(sha256(toBytes(signature)));

    // The secretHash is SHA256 of the secret
    const secretHash = with0x(sha256(toBytes(secret)));

    return { secret, secretHash };
}

// Prepare message for signing
export function prepareSignMessage(nonce: string): string {
    return "Avalanche Bridge" + nonce.toString();
}

// Store secret in localStorage
export function storeSecret(orderId: string, secretData: SecretData): void {
    if (typeof window === "undefined") return;
    const key = `order_secret_${orderId}`;
    localStorage.setItem(key, JSON.stringify(secretData));
}

// Retrieve secret from localStorage
export function getSecret(orderId: string): SecretData | null {
    if (typeof window === "undefined") return null;
    const key = `order_secret_${orderId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as SecretData;
    } catch {
        return null;
    }
}

