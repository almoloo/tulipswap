'use client';

import { Wallet } from '@/lib/wallet';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';

export default function Home() {
	const { data: walletClient } = useWalletClient();

	const [fromAmount, setFromAmount] = useState('');
	const [toAmount, setToAmount] = useState('');
	const [fromAddress, setFromAddress] = useState('');
	const [signer, setSigner] = useState<ethers.Signer | null>(null);

	const provider = new ethers.JsonRpcProvider(
		'https://polygon-pokt.nodies.app'
	);

	useEffect(() => {
		if (!walletClient) return;
		const pr = new ethers.BrowserProvider(walletClient.transport);
		pr.getSigner().then((s) => setSigner(s));
	}, [walletClient]);

	async function handleSwapClick() {
		const srcChainUser: Wallet = new Wallet(signer!, provider);
	}
	return (
		<div className="m-5">
			<h1>Homepage</h1>
			{/* FROM */}
			<div className="border p-5">
				<h2>From EVM:</h2>
				<input
					type="text"
					placeholder="Amount"
					value={fromAmount}
					onChange={(e) => setFromAmount(e.target.value)}
					required
				/>
				<br />
				<appkit-button />
			</div>
			{/* TO */}
			<div className="border p-5">
				<h2>To APTOS:</h2>
				<input
					type="text"
					placeholder="Amount"
					value={toAmount}
					onChange={(e) => setToAmount(e.target.value)}
					required
				/>
			</div>
			<button
				className="bg-white text-black px-3 py-1"
				onClick={handleSwapClick}
			>
				Swap
			</button>
		</div>
	);
}
