'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '../utils/wagmi'; // Import your wagmi config
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit'; // Import ConnectKitProvider

// Create a react-query client
const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="midnight"> {/* Wrap with ConnectKitProvider, choose theme (e.g., 'midnight' for dark) */}
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}