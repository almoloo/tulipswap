'use client';

import {
	limitOrderProtocol,
	NewNetworkEnum,
	provider,
	srcEscrowFactory,
	tokens,
} from '@/lib/constants';
import { createOrder } from '@/lib/create-order';
import { Wallet } from '@/lib/wallet';
import { uint8ArrayToHex } from '@1inch/byte-utils';
import { SupportedChain, NetworkEnum, Address } from '@1inch/cross-chain-sdk';
import { ethers, MaxUint256, randomBytes } from 'ethers';
import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';

export default function Home() {
	const { data: walletClient } = useWalletClient();

	const [fromAmount, setFromAmount] = useState('');
	const [toAmount, setToAmount] = useState('');
	const [fromAddress, setFromAddress] = useState('');
	const [signer, setSigner] = useState<ethers.Signer | null>(null);

	useEffect(() => {
		if (!walletClient) return;
		const pr = new ethers.BrowserProvider(walletClient.transport);
		// const pr = new ethers.BrowserProvider();
		pr.getSigner().then((s) => setSigner(s));
	}, [walletClient]);

	async function handleSwapClick() {
		const srcToken = tokens.filter((t) => t.name === 'USDC')[0];
		const destToken = tokens.filter((t) => t.name === 'USDC')[0];
		const srcChainId = NetworkEnum.POLYGON;
		const dstChainId = NewNetworkEnum.APTOS as unknown as SupportedChain;

		const srcTokenAddress = new Address(srcToken.addressPolygon);
		const destTokenAddress = new Address(destToken.addressAptosFake);

		const srcChainUser = new Wallet(signer!, provider);
		// const destChainUser;
		// const srcChainResolver = new Wallet()
		// const destChainResolver;

		const srcFactory = srcEscrowFactory;

		// APPROVE TOKEN ON SRC
		// await srcChainUser.approveToken(
		// 	srcToken.addressPolygon,
		// 	limitOrderProtocol.polygon,
		// 	MaxUint256
		// );

		// GENERATE SECRET
		const secret = uint8ArrayToHex(randomBytes(32)); // TODO: use crypto secure random number in real world

		// CREATE ORDER
		const order = await createOrder(
			await srcChainUser.getAddress(),
			srcTokenAddress,
			destTokenAddress,
			srcChainId,
			dstChainId,
			secret
		);

		console.log('🎈', order);
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
				{/* <appkit-button /> */}
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
