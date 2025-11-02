export const LOCAL_STORAGE_KEYS = {
  notification: "notification",
  deletedOrders: "deletedOrders",
  evmWallet: "evmWallet",
  btcWallet: "btcWallet",
} as const;

export const WALLET_TYPES = {
  EVM: "evm",
  BTC: "btc",
} as const;

export const SUPPORTED_CHAINS = {
  AVALANCHE: 43114,
  ETHEREUM: 1,
  POLYGON: 137,
} as const;

export const network = "testnet";

export const API_URLS = {
  QUOTE: "http://bck8kwssk4swg08ogwk08wo0.116.202.246.116.sslip.io",
  ORDERBOOK: "http://localhost:4455",
  ORDERS: "http://bkk8o4k4sgkssccsks8cw0sw.116.202.246.116.sslip.io",
} as const;
