import { EscrowFactory } from '@/lib/escrow-factory';
import { SupportedChains, Address } from '@1inch/cross-chain-sdk';
import { ethers } from 'ethers';
import { NewAddress } from './new-sdk';

export enum NewNetworkEnum {
	APTOS = SupportedChains[5],
}

export const tokens: Array<TokenInfo> = [
	{
		name: 'USDC',
		addressEVM: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		addressAptos:
			'0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b',
		addressAptosFake: '0x1111111111111111111111111111111111110001',
		addressPolygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
	},
	{
		name: 'USDT',
		addressEVM: '0xdac17f958d2ee523a2206206994597c13d831ec7',
		addressAptos:
			'0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
		addressAptosFake: '0x2222222222222222222222222222222222220002',
		addressPolygon: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
	},
	{
		name: 'CAKE',
		addressEVM: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898',
		addressAptos:
			'0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT',
		addressAptosFake: '0x3333333333333333333333333333333333330003',
		addressPolygon: '0x0D1E753a25eBda689453309112904807625bEFBe',
	},
];

export const limitOrderProtocol = {
	polygon: '0x94bc2a1c732bcad7343b25af48385fe76e08734f',
	ethereum: '0x119c71d3bbac22029622cbaec24854d3d32d2828',
};

export const provider = new ethers.JsonRpcProvider(
	'https://polygon-pokt.nodies.app'
);

export const srcEscrowFactoryAddress =
	'0xa7bCb4EAc8964306F9e3764f67Db6A7af6DdF99A';

export const srcEscrowFactory = new EscrowFactory(
	provider,
	srcEscrowFactoryAddress
);

// export const resolverAddress: Address = Object.assign(
// 	Object.create(Address.prototype),
// 	{
// 		value: '0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT', // TODO: CHANGE LATER
// 		toString() {
// 			return this.value;
// 		},
// 	}
// );

export const resolverAddress = new NewAddress(
	'0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a'
) as unknown as Address;
