import {
	SupportedChain,
	Address,
	CrossChainOrder,
	randBigInt,
	HashLock,
	TimeLocks,
	AuctionDetails,
} from '@1inch/cross-chain-sdk';
import {
	provider,
	resolverAddress,
	srcEscrowFactoryAddress,
} from '@/lib/constants';
import { parseEther, parseUnits } from 'ethers';
import { UINT_40_MAX } from '@1inch/byte-utils';

export const createOrder = async (
	srcSide: 'EVM' | 'APTOS',
	srcUserAddress: string,
	srcTokenAddress: Address,
	destTokenAddress: Address,
	srcChainId: SupportedChain,
	destChainId: SupportedChain,
	secret: string
) => {
	console.log(
		srcUserAddress,
		srcTokenAddress,
		destTokenAddress,
		srcChainId,
		destChainId,
		secret
	);
	const srcTimestamp = BigInt((await provider.getBlock('latest'))!.timestamp);

	const order = CrossChainOrder.new(
		new Address(srcEscrowFactoryAddress),
		{
			salt: randBigInt(1000n),
			maker: new Address(srcUserAddress),
			makingAmount: parseUnits('100', 6), // TODO: CHANGE VALUE
			takingAmount: parseUnits('99', 6), // TODO: CHANGE VALUE
			makerAsset: srcTokenAddress,
			takerAsset: destTokenAddress,
		},
		{
			hashLock: HashLock.forSingleFill(secret),
			timeLocks: TimeLocks.new({
				srcWithdrawal: 10n, // 10sec finality lock for test
				srcPublicWithdrawal: 120n, // 2m for private withdrawal
				srcCancellation: 121n, // 1sec public withdrawal
				srcPublicCancellation: 122n, // 1sec private cancellation
				dstWithdrawal: 10n, // 10sec finality lock for test
				dstPublicWithdrawal: 100n, // 100sec private withdrawal
				dstCancellation: 101n, // 1sec public withdrawal
			}),
			srcChainId,
			dstChainId: destChainId,
			srcSafetyDeposit: parseEther('0.001'),
			dstSafetyDeposit: parseEther('0.001'),
		},
		{
			auction: new AuctionDetails({
				initialRateBump: 0,
				points: [],
				duration: 120n,
				startTime: srcTimestamp,
			}),
			whitelist: [
				{
					address: resolverAddress,
					allowFrom: 0n,
				},
			],
			resolvingStartTime: 0n,
		},
		{
			nonce: randBigInt(UINT_40_MAX),
			allowPartialFills: false,
			allowMultipleFills: false,
		}
	);

	return order;
};
