import WalletConnectProvider from '@/services/providers/wallet-connect';
import { headers } from 'next/headers';
import AptosWalletProvider from '@/services/providers/aptos-wallet';

interface ProvidersProps {
	children: React.ReactNode;
}

export default async function Providers({ children }: ProvidersProps) {
	const headersObj = await headers();
	const cookies = headersObj.get('cookie');

	return (
		<>
			<WalletConnectProvider cookies={cookies}>
				<AptosWalletProvider>{children}</AptosWalletProvider>
			</WalletConnectProvider>
		</>
	);
}
