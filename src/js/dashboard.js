let referralArr = [];
let total = 0;
let referral24Hours = 0;
let totalUsers24Hours = 0;

function init() {
	$(".loader-section").css("display", "none");
	$("#totalUsers").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#totalEth").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#totalUSD").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#partnersUser").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#totalDay").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#earnedEth").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#earnedUSD").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#idLevel").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	$("#idNum").html(
		'<img class="loading_image" src="images/loader.svg"  alt="loading"/>'
	);
	let url =
		"https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd";
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			let price = data.tron.usd;
			getUserProfitsAmount(price);
			getTotalEthProfit(price);
		})
		.catch((err) => {
			console.log("fetch data URL failed");
			console.log(err);
		});
	getUserDetails();
	getTotalUsers();
	getUserReferrals(sessionStorage.currentAccount, 10);
	createBuyEvents();
}

function getUserProfitsAmount(price) {
	contractGlobal
		.getUserProfits(sessionStorage.currentAccount)
		.call()
		.then((result) => {
			let arr = result[2];
			let sum = 0;
			for (let i = 0; i < arr.length; i++) {
				sum += parseInt(arr[i]);
			}
			sum /= multiplier;
			$("#earnedEth").text(sum);
			let usd = price * sum;
			$("#earnedUSD").text(usd.toFixed(2));
		})
		.catch((err) => {
			console.error("Call for User Profits Failed");
			console.log(err);
		});
}

function getTotalEthProfit(price, ts) {
	let timestamp = ts ? ts : 0;
	tronWebGlobal
		.getEventResult(contractAddress, {
			onlyConfirmed: true,
			eventName: "GetLevelProfitEvent",
			sinceTimestamp: timestamp,
			size: 200,
		})
		.then((event) => {
			for (let i = 0; i < event.length; i++) {
				let level = event[i].result.level;
				switch (level) {
					case "1":
						total += 180;
						break;
					case "2":
						total += 450;
						break;
					case "3":
						total += 2400;
						break;
					case "4":
						total += 10000;
						break;
					case "5":
						total += 20000;
						break;
					case "6":
						total += 35000;
						break;
					default:
				}
			}
			let usd = (total * price).toFixed(2);
			$("#totalEth").text(total.toFixed(2));
			$("#totalUSD").text(usd);
			if (event.length == 200) {
				ts = event[199].timestamp;
				getTotalEthProfit(price, ts);
			}
		})
		.catch((err) => {
			getTotalEthProfit(price, ts);
			console.log(`getTotalEthProfit failed: ${err}`);
		});
}

async function getUserReferrals(addr, depth) {
	let queue = [];
	queue.push({
		address: addr,
		level: 0,
	});

	while (queue.length !== 0) {
		let address = queue.pop();
		let result = await contractGlobal
			.getUserReferrals(address.address)
			.call();

		for (let i = 0; i < result.length; i++) {
			if (address.level <= depth) {
				queue.push({
					address: result[i],
					level: address.level + 1,
				});
				referralArr.push(tronWebGlobal.address.fromHex(result[i]));
			}
		}
	}
	displayNewPartners(0);
}

function displayNewPartners(ts) {
	tronWebGlobal
		.getEventResult(contractAddress, {
			onlyConfirmed: true,
			eventName: "RegisterUserEvent",
			sinceTimestamp: ts,
			size: 200,
		})
		.then((event) => {
			let yesterday = new Date().getTime() / 1000 - 86400;

			for (let i = 0; i < event.length; i++) {
				let obj = event[i];
				if (
					referralArr.indexOf(
						tronWebGlobal.address.fromHex(obj.result.user)
					) !== -1 &&
					obj.result.time > yesterday
				) {
					referral24Hours += 1;
				}
				if (obj.result.time > yesterday) {
					totalUsers24Hours += 1;
				}
			}
			$("#partnersUser").text(referralArr.length + "/" + referral24Hours);
			$("#totalDay").text(totalUsers24Hours);
			if (event.length === 200) {
				let ts = event[199].timestamp;
				displayNewPartners(ts);
			}
		});
}

function getTotalUsers() {
	contractGlobal
		.last_uid()
		.call()
		.then((result) => {
			$("#totalUsers").text(result);
		})
		.catch((err) => {
			console.log("last_uid failed");
			console.log(err);
		});
}

function addEventsForLevelBuy(level) {
	let price = [1000, 3000, 20000, 100000, 250000, 500000];
	let value = price[level - 1] * multiplier;

	showPopup(
		"#fadeLoading",
		"Please Wait while the transaction completes for Level " +
			level +
			" contract!"
	);

	contractGlobal
		.buyLevel(level)
		.send({
			feeLimit: 1000000000,
			callValue: value,
		})
		.then(async function (receipt) {
			$("#fadeLoading").popup("hide");
			showPopup(
				"#fadeLoading",
				"Waiting for the transaction to complete, please wait..."
			);
			checkTransactionStatus(receipt, 0)
				.then(async (res) => {
					$("#fadeLoading").popup("hide");
					if (
						typeof res.ret === "undefined" ||
						typeof res.ret[0].contractRet === "undefined"
					) {
						showPopup("#fade", "Transaction failed");
					} else {
						if (res.ret[0].contractRet === "REVERT") {
							showPopup(
								"#fade",
								"Transaction failed: Transaction was reversed"
							);
						} else if (res.ret[0].contractRet === "SUCCESS") {
							console.log(res)
							showPopup(
								"#fade",
								"Congratulation! You have purchased a new Level " +
									level +
									" contract!"
							);
							getUserDetails();
						} else {
							console.log(res)
							showPopup(
								"#fade",
								"Transaction failed: Transaction status not recognized"
							);
						}
					}
				})
				.catch((err) => {
					$("#fadeLoading").popup("hide");
					console.log("checkTransactionStatus ERR: " + err);
					showPopup("#fade", "Transaction failed: " + err);
				});
		})
		.catch((err) => {
			console.error(err);
			$("#fadeLoading").popup("hide");
			showPopup("#fade", "Oops! There was some error! Please try Again!");
		});
}

function createBuyEvents() {
	$("#level1")
		.children()
		.find("button")
		.click(() => {
			addEventsForLevelBuy(1);
		});
	$("#level2")
		.children()
		.find("button")
		.click(() => {
			addEventsForLevelBuy(2);
		});
	$("#level3")
		.children()
		.find("button")
		.click(() => {
			addEventsForLevelBuy(3);
		});
	$("#level4")
		.children()
		.find("button")
		.click(() => {
			addEventsForLevelBuy(4);
		});
	$("#level5")
		.children()
		.find("button")
		.click(() => {
			addEventsForLevelBuy(5);
		});
	$("#level6")
		.children()
		.find("button")
		.click(() => {
			addEventsForLevelBuy(6);
		});
}
