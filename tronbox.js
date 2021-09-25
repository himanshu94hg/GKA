let mnemonic =
	"tip income female belt clog yard language buyer expose devote dog game";

module.exports = {
	networks: {
		mainnet: {
			privateKey: process.env.PRIVATE_KEY_MAINNET,
			userFeePercentage: 100,
			feeLimit: 1e9,
			fullHost: "https://api.trongrid.io",
			network_id: "1",
		},
		shasta: {
			privateKey:
				"3938b48e755bd18f8b1dd5439a46ab3637b4225c411d80894eb384cbc7c3540b",
			userFeePercentage: 50,
			feeLimit: 1e9,
			fullHost: "https://api.shasta.trongrid.io",
			network_id: "2",
		},
		development: {
			privateKey:
				"3938b48e755bd18f8b1dd5439a46ab3637b4225c411d80894eb384cbc7c3540b",
			userFeePercentage: 0,
			feeLimit: 1e9,
			fullHost: "http://127.0.0.1:9090",
			network_id: "9",
		},
		compilers: {
			solc: {
				version: "0.5.10",
			},
		},
	},
};
