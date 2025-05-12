'use client';

import { wagmiConfig } from '../utils/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { MiniKitProvider } from '@coinbase/onchainkit/minikit'; // Remove MiniKitProvider import
import { WagmiProvider } from 'wagmi'; // Import WagmiProvider
import { ConnectKitProvider } from 'connectkit';
// import '@coinbase/onchainkit/styles.css'; // Remove OnchainKit styles if no other OnchainKit components are used

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}> 
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider 
          theme="auto"
          // The 'options' prop with 'walletList' might not be necessary anymore,
          // or you might want to adjust it. For now, let's remove it to see ConnectKit's default behavior.
          // options={{
          //   walletList: ['injected', 'coinbaseWallet'], 
          // }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}