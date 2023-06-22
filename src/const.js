export const EIP712_QUOTE_CONTRACT =
	"0x3cD7DAcBa734ECE1Bb3548B87CF3C84C0D855F4f";
	// export const CUSTOM_QUOTE_CONTRACT =
	// 	"0x6645b295b588cbACA37229D65067AaA124E3D4E0";
export const CUSTOM_QUOTE_CONTRACT = "0xc16eF40E6e2b9aD614B50Bb6b1DB50453D84B103";
export const LEGACY_712_CONTRACT =
	"0x465F55aEaFB5291757c3E422663A206D13c1f2DF";
export const LEGACY_CUSTOM_CONTRACT =
	"0x853bfD0160d67DF13a9F70409f9038f6473585Bd";

// export const BACKUP_API_KEY = "UuKYepGMT.598c9543-80e0-4b49-9e9d-7ba43f48c622";
export const FUNDING_KEY = "1682412004732";
// export const API_KEY = "_sEgPZpdS.ca79a1cc-94aa-4451-ae1e-4dda8ea59ccb";
// export const API_KEY = "DHE3O6t-6.35244616-695f-4dd4-8f23-26414450b9d3";
export const API_KEY = "OKB3O6t-6.35244616-695f-4dd4-8f23-26414450b9d3";

export const ABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "userAddress",
				type: "address",
			},
			{
				indexed: false,
				internalType: "addresspayable",
				name: "relayerAddress",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "functionSignature",
				type: "bytes",
			},
		],
		name: "MetaTransactionExecuted",
		type: "event",
	},
	{
		inputs: [
			{ internalType: "address", name: "userAddress", type: "address" },
			{ internalType: "bytes", name: "functionSignature", type: "bytes" },
			{ internalType: "bytes32", name: "sigR", type: "bytes32" },
			{ internalType: "bytes32", name: "sigS", type: "bytes32" },
			{ internalType: "uint8", name: "sigV", type: "uint8" },
		],
		name: "executeMetaTransaction",
		outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "user", type: "address" }],
		name: "getNonce",
		outputs: [{ internalType: "uint256", name: "nonce", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getQuote",
		outputs: [
			{ internalType: "string", name: "currentQuote", type: "string" },
			{ internalType: "address", name: "currentOwner", type: "address" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "quote",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "string", name: "newQuote", type: "string" }],
		name: "setQuote",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];

