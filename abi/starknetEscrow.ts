export const starknetHTLC = [
    {
        "name": "TokenSwapEscrowImpl",
        "type": "impl",
        "interface_name": "starknet_contracts::interface::escrow::ITokenSwapEscrow"
    },
    {
        "name": "core::integer::u256",
        "type": "struct",
        "members": [
            {
                "name": "low",
                "type": "core::integer::u128"
            },
            {
                "name": "high",
                "type": "core::integer::u128"
            }
        ]
    },
    {
        "name": "starknet_contracts::interface::escrow::Swap",
        "type": "struct",
        "members": [
            {
                "name": "asset_token",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "creator",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "recipient",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "created_at",
                "type": "core::integer::u256"
            },
            {
                "name": "expiry_blocks",
                "type": "core::integer::u128"
            },
            {
                "name": "amount",
                "type": "core::integer::u256"
            },
            {
                "name": "completed_at",
                "type": "core::integer::u256"
            }
        ]
    },
    {
        "name": "starknet_contracts::interface::escrow::ITokenSwapEscrow",
        "type": "interface",
        "items": [
            {
                "name": "get_swap",
                "type": "function",
                "inputs": [
                    {
                        "name": "swap_id",
                        "type": "core::felt252"
                    }
                ],
                "outputs": [
                    {
                        "type": "starknet_contracts::interface::escrow::Swap"
                    }
                ],
                "state_mutability": "view"
            },
            {
                "name": "get_chain_id",
                "type": "function",
                "inputs": [],
                "outputs": [
                    {
                        "type": "core::felt252"
                    }
                ],
                "state_mutability": "view"
            },
            {
                "name": "create_swap",
                "type": "function",
                "inputs": [
                    {
                        "name": "token",
                        "type": "core::starknet::contract_address::ContractAddress"
                    },
                    {
                        "name": "recipient",
                        "type": "core::starknet::contract_address::ContractAddress"
                    },
                    {
                        "name": "expiry_blocks",
                        "type": "core::integer::u128"
                    },
                    {
                        "name": "amount",
                        "type": "core::integer::u256"
                    },
                    {
                        "name": "commitment_hash",
                        "type": "[core::integer::u32; 8]"
                    }
                ],
                "outputs": [],
                "state_mutability": "external"
            },
            {
                "name": "create_swap_for",
                "type": "function",
                "inputs": [
                    {
                        "name": "token",
                        "type": "core::starknet::contract_address::ContractAddress"
                    },
                    {
                        "name": "creator",
                        "type": "core::starknet::contract_address::ContractAddress"
                    },
                    {
                        "name": "recipient",
                        "type": "core::starknet::contract_address::ContractAddress"
                    },
                    {
                        "name": "expiry_blocks",
                        "type": "core::integer::u128"
                    },
                    {
                        "name": "amount",
                        "type": "core::integer::u256"
                    },
                    {
                        "name": "commitment_hash",
                        "type": "[core::integer::u32; 8]"
                    }
                ],
                "outputs": [],
                "state_mutability": "external"
            },
            {
                "name": "claim_swap",
                "type": "function",
                "inputs": [
                    {
                        "name": "swap_id",
                        "type": "core::felt252"
                    },
                    {
                        "name": "secret",
                        "type": "core::array::Array::<core::integer::u32>"
                    }
                ],
                "outputs": [],
                "state_mutability": "external"
            },
            {
                "name": "cancel_swap",
                "type": "function",
                "inputs": [
                    {
                        "name": "swap_id",
                        "type": "core::felt252"
                    }
                ],
                "outputs": [],
                "state_mutability": "external"
            }
        ]
    },
    {
        "name": "constructor",
        "type": "constructor",
        "inputs": []
    },
    {
        "kind": "struct",
        "name": "starknet_contracts::events::escrow::SwapCreated",
        "type": "event",
        "members": [
            {
                "kind": "key",
                "name": "swap_id",
                "type": "core::felt252"
            },
            {
                "kind": "key",
                "name": "creator",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "kind": "key",
                "name": "recipient",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "kind": "data",
                "name": "token",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "kind": "data",
                "name": "amount",
                "type": "core::integer::u256"
            }
        ]
    },
    {
        "kind": "struct",
        "name": "starknet_contracts::events::escrow::SwapClaimed",
        "type": "event",
        "members": [
            {
                "kind": "key",
                "name": "swap_id",
                "type": "core::felt252"
            },
            {
                "kind": "key",
                "name": "recipient",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "kind": "data",
                "name": "token",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "kind": "data",
                "name": "secret",
                "type": "core::array::Array::<core::integer::u32>"
            }
        ]
    },
    {
        "kind": "struct",
        "name": "starknet_contracts::events::escrow::SwapCancelled",
        "type": "event",
        "members": [
            {
                "kind": "key",
                "name": "swap_id",
                "type": "core::felt252"
            },
            {
                "kind": "key",
                "name": "creator",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "kind": "data",
                "name": "token",
                "type": "core::starknet::contract_address::ContractAddress"
            }
        ]
    },
    {
        "kind": "enum",
        "name": "starknet_contracts::escrow::TokenSwapEscrow::Event",
        "type": "event",
        "variants": [
            {
                "kind": "nested",
                "name": "SwapCreated",
                "type": "starknet_contracts::events::escrow::SwapCreated"
            },
            {
                "kind": "nested",
                "name": "SwapClaimed",
                "type": "starknet_contracts::events::escrow::SwapClaimed"
            },
            {
                "kind": "nested",
                "name": "SwapCancelled",
                "type": "starknet_contracts::events::escrow::SwapCancelled"
            }
        ]
    }
]