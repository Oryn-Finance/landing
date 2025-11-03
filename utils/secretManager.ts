import { sha256 } from "viem";
import { DigestKey } from "./digestKey";
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';


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

export const generateSecret = async (nonce: string): Promise<{ secret: `0x${string}`; secretHash: `0x${string}` }> => {
    const signature = await signMessage(nonce);
    if (!signature) {
        throw new Error('Failed to sign message');
    }

    if (signature instanceof Error) {
        throw signature;
    }

    const secret = sha256(with0x(signature));
    const secretHash = sha256(secret);
    return { secret, secretHash };
}

const signMessage = async (nonce: string) => {
    const digestKey = DigestKey.getDigestKey();
    if (!digestKey) {
        throw new Error('No digest key found');
    }
    const ECPair = ECPairFactory(ecc);

    const signMessage = 'Avalanche Bridge' + nonce.toString();
    const signMessageBuffer = Buffer.from(signMessage, 'utf8');
    const hash = sha256(signMessageBuffer);

    const digestKeyBuf = Buffer.from(trim0x(digestKey), 'hex');
    if (digestKeyBuf.length !== 32) {
        return new Error('Invalid private key length. Expected 32 bytes.');
    }
    const keyPair = ECPair.fromPrivateKey(digestKeyBuf);
    const signature = keyPair.sign(Buffer.from(trim0x(hash), 'hex')).toString();
    return signature as `0x${string}`;
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

