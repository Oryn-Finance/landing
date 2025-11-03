export const evmHTLCABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "cancelSwap",
        "inputs": [
            {
                "name": "swapId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "claimSwap",
        "inputs": [
            {
                "name": "swapId",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "secret",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createSwap",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "expiryBlocks",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "commitmentHash",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createSwapFor",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "creator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "expiryBlocks",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "commitmentHash",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "swaps",
        "inputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "assetToken",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "creator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "createdAt",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "expiryBlocks",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "completedAt",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "SwapCancelled",
        "inputs": [
            {
                "name": "swapId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "creator",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SwapClaimed",
        "inputs": [
            {
                "name": "swapId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "recipient",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "secret",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SwapCreated",
        "inputs": [
            {
                "name": "swapId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "creator",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "recipient",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__DuplicateSwap",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__IncorrectSecret",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__SameCreatorAndRecipient",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__SameDepositorAndRecipient",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__SwapAlreadyCompleted",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__SwapNotCreated",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__SwapNotExpired",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__ZeroAddressCreator",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__ZeroAddressRecipient",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__ZeroAmount",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenSwapEscrow__ZeroExpiryBlocks",
        "inputs": []
    }
]