// HTLC ABI - minimal ABI for redeem function
export const AtomicSwapABI = [
    {
        inputs: [
            { internalType: "bytes32", name: "swapId", type: "bytes32" },
            { internalType: "bytes32", name: "secret", type: "bytes32" },
        ],
        name: "redeem",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

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

// Get chain ID from asset string (e.g., "arbitrum_sepolia:wbtc" -> arbitrumSepolia chain ID)
export function getChainIdFromAsset(asset: string): number | null {
    const chainName = asset.split(":")[0];
    const chainIdMap: Record<string, number> = {
        avalanche_testnet: 43113, // avalancheFuji.id
        arbitrum_sepolia: 421614, // arbitrumSepolia.id
        // Add more chains as needed
    };
    return chainIdMap[chainName] || null;
}
