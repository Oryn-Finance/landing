import { useState, useEffect } from 'react';

export const useWalletConnect = () => {
  const [uri, setUri] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [signClient, setSignClient] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';
        
        if (!projectId || projectId === 'YOUR_PROJECT_ID') {
          console.warn('⚠️ WalletConnect Project ID not set. Get one at https://cloud.walletconnect.com');
          return;
        }
        
        const { SignClient } = await import('@walletconnect/sign-client');
        
        const client = await SignClient.init({
          projectId,
          metadata: {
            name: 'Oryn',
            description: 'Cross-chain DeFi Platform',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://oryn.app',
            icons: [typeof window !== 'undefined' ? `${window.location.origin}/OrynGlass2.png` : 'https://oryn.app/icon.png'],
          },
        });

        setSignClient(client);
        console.log('✅ WalletConnect SignClient initialized');

        client.on('session_update', ({ topic, params }: any) => {
          console.log('🔔 Session updated:', topic, params);
          const updatedSession = client.session.get(topic);
          setSession(updatedSession);
        });

        client.on('session_event', (event: any) => {
          console.log('📨 Session event:', event);
        });

        client.on('session_delete', () => {
          console.log('🔌 Session deleted - user disconnected from wallet');
          setConnected(false);
          setAddress('');
          setUri('');
          setSession(null);
        });

        const existingSessions = client.session.getAll();
        if (existingSessions.length > 0) {
          const lastSession = existingSessions[existingSessions.length - 1];
          setSession(lastSession);
          setConnected(true);
          
          const accounts = Object.values(lastSession.namespaces)[0]?.accounts || [];
          if (accounts.length > 0) {
            const walletAddress = (accounts[0] as string).split(':').pop();
            setAddress(walletAddress || '');
            console.log('💰 Restored session with address:', walletAddress);
          }
        }

      } catch (error) {
        console.error('❌ WalletConnect init error:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initWalletConnect();
    }
  }, []);

  const connect = async (chain: 'zcash') => {
    try {
      if (!signClient) {
        throw new Error('WalletConnect not initialized');
      }

      console.log('🔗 Initiating WalletConnect connection for', chain);

      const { uri: connectionUri, approval } = await signClient.connect({
        requiredNamespaces: {
          zcash: {
            methods: [
              'zcash_sendTransaction',
              'zcash_signMessage',
            ],
            chains: ['zcash:1'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      if (connectionUri) {
        setUri(connectionUri);
        console.log('📱 QR URI generated:', connectionUri);

        approval().then((approvedSession: any) => {
          console.log('✅ Session approved by wallet!', approvedSession);
          setSession(approvedSession);
          setConnected(true);
          
          const accounts = approvedSession.namespaces.zcash?.accounts || [];
          if (accounts.length > 0) {
            const walletAddress = accounts[0].split(':').pop();
            if (walletAddress) {
              setAddress(walletAddress);
              console.log('💰 Zcash wallet connected:', walletAddress);
            }
          }
        }).catch((error: any) => {
          console.error('❌ Session approval rejected or failed:', error);
          setUri('');
        });

        return connectionUri;
      }

      throw new Error('Failed to generate connection URI');
    } catch (error) {
      console.error('❌ WalletConnect connection error:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      if (signClient && session) {
        await signClient.disconnect({
          topic: session.topic,
          reason: {
            code: 6000,
            message: 'User disconnected',
          },
        });
        console.log('🔌 Disconnected from WalletConnect session');
      }
      setUri('');
      setConnected(false);
      setAddress('');
      setSession(null);
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  };

  return {
    uri,
    connected,
    address,
    session,
    connect,
    disconnect,
    isInitialized: signClient !== null,
  };
};

