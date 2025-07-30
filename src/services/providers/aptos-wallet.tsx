'use client';

import { Network } from '@aptos-labs/ts-sdk';
import {
	AptosWalletAdapterProvider,
	type DappConfig,
} from '@aptos-labs/wallet-adapter-react';

interface AptosWalletProviderProps {
	children: React.ReactNode;
}

export default function AptosWalletProvider({
	children,
}: AptosWalletProviderProps) {
	const config: DappConfig = {
		network: Network.MAINNET,
		aptosApiKeys: {
			mainnet: process.env.NEXT_PUBLIC_APTOS_API_KEY!,
		},
	};
	return (
		<AptosWalletAdapterProvider
			autoConnect={true}
			dappConfig={config}
			onError={(error) => console.error('error', error)}
		>
			{children}
		</AptosWalletAdapterProvider>
	);
}
