'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectId, wagmiAdapter } from '@/services/wagmi';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, polygon } from '@reown/appkit/networks';
import { type Config, cookieToInitialState, WagmiProvider } from 'wagmi';

interface WalletConnectProviderProps {
	children: React.ReactNode;
	cookies: string | null;
}

const queryClient = new QueryClient();

if (!projectId) {
	throw new Error('Project ID is not defined');
}

const metadata = {
	name: 'TulipSwap',
	description: 'Fusion+ swap between EVM and Aptos',
	url: process.env.NEXT_PUBLIC_URL!,
	icons: [],
};

const modal = createAppKit({
	adapters: [wagmiAdapter],
	projectId,
	networks: [mainnet, polygon],
	defaultNetwork: polygon,
	metadata,
	features: {
		analytics: false,
	},
});

export default function WalletConnectProvider({
	children,
	cookies,
}: WalletConnectProviderProps) {
	const initialState = cookieToInitialState(
		wagmiAdapter.wagmiConfig as Config,
		cookies
	);
	return (
		<WagmiProvider
			config={wagmiAdapter.wagmiConfig as Config}
			initialState={initialState}
		>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	);
}
