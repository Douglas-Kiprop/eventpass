'use client';

// WagmiProvider and QueryClientProvider are effectively handled by MiniKitProvider
// when it's given wagmiConfig and queryClient props.
// import { WagmiProvider } from 'wagmi'; 
// import { QueryClientProvider } from '@tanstack/react-query';

import { config } from '../utils/wagmi'; // Your wagmi config
import { QueryClient } from '@tanstack/react-query'; // Still need to create a QueryClient instance

import { MiniKitProvider } from '@coinbase/onchainkit/minikit'; // Import MiniKitProvider
import '@coinbase/onchainkit/styles.css'; // Ensure OnchainKit styles are globally available

import { ConnectKitProvider } from 'connectkit';

// Create a react-query client instance
const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <MiniKitProvider
      wagmiConfig={config} // MiniKitProvider uses this to set up Wagmi context
      queryClient={queryClient} // MiniKitProvider uses this to set up React Query context
      projectId="10719d17-77e2-450d-b9ed-0d8c4d0975de" // Your project ID
      // notificationProxyUrl="/api/notification" // Optional: if you use MiniKit notifications
    >
      {/* ConnectKitProvider needs to be within a Wagmi/Query context, 
          which MiniKitProvider now supplies. */}
      <ConnectKitProvider theme="auto"> {/* You can choose 'dark', 'light', or 'auto' */}
        {children}
      </ConnectKitProvider>
    </MiniKitProvider>
  );
}