export type SwapIntent = {
  swap_id: string;
  asset: string;
  token_address: string;
  creator: string;
  recipient: string;
  created_at: number;
  expiry_blocks: number;
  amount: string;
  completed_at: number;
  deposit_address: string;
  commitment_hash: string;
  commitment: string | null;
  escrow_address: string;
  state: string | null;
  transactions: {
    create_tx: string | null;
    cancel_tx: string | null;
    claim_tx: string | null;
  };
};

export type Order = {
  order_id: string;
  source_intent: SwapIntent;
  destination_intent: SwapIntent;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "initiated"
  | "awaiting_deposit"
  | "deposit_detected"
  | "redeeming"
  | "complete";
