multiplier = 1000000;
contractAddress = "TH396b6H3oSStELyQiMCem2G9zkjMaidDD";

let tronWebGlobal;
let contractGlobal;
let isOwner = false;
let refer = "";
let isReferredLink = false;

if (sessionStorage.isViewOnly === "true") {
	$(async function () {
		setTimeout(async () => {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			if (urlParams.get("refId")) {
				refer = urlParams.get("refId");
				isReferredLink = true;
				$("#ref-addr").val(urlParams.get("refId"));
			}

			if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
				tronWebGlobal = window.tronWeb;
			} else {
				tronWebGlobal = new TronWeb({
					fullNode: "https://api.trongrid.io/",
					solidityNode: "https://api.trongrid.io/",
					eventServer: "https://api.trongrid.io/",
				});
			}
			if (
				typeof sessionStorage.currentAccount === "undefined" ||
				sessionStorage.currentAccount === "undefined"
			) {
				sessionStorage.currentAccount =
					"TRYNUpi1wcxgHciEop6nZ8CRPALmxn6Ms1";
			}
			await tronWebGlobal.setAddress(sessionStorage.currentAccount);
			tronWebGlobal
				.contract()
				.at(contractAddress)
				.then((contract) => {
					contractGlobal = contract;
					_init(sessionStorage.currentAccount);
					if (typeof init === "function") {
						init();
					}
				})
				.catch((err) => {
					console.error(
						"Failed to get contract. Are you connected to main net?"
					);
					console.log(err);
					showPopup(
						"#fade",
						"Failed to get contract. Are you connected to main net?"
					);
				});
		}, 500);
	});
} else {
	$(async function () {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if (urlParams.get("refId")) {
			refer = urlParams.get("refId");
			isReferredLink = true;
			$("#ref-addr").val(urlParams.get("refId"));
		}

		let count = 0;
		let obj = setInterval(async () => {
			count += 1;
			if (count >= 600) {
				//showPopup('#fade', 'Tronlink wallet not found');
				if (
					window.location.href.indexOf("/index.html") === -1 &&
					window.location.href.indexOf(".html") !== -1
				) {
					window.location.href = "/";
				}
			}
			if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
				clearInterval(obj);
				tronWebGlobal = window.tronWeb;
				tronWebGlobal
					.contract()
					.at(contractAddress)
					.then(async (contract) => {
						contractGlobal = contract;
						if (typeof init === "function") {
							getAccount()
								.then(async () => {
									_init(sessionStorage.currentAccount);
									let userDetails = await contractGlobal
										.getUserDetails(
											sessionStorage.currentAccount
										)
										.call();
									if (
										typeof userDetails !== "undefined" &&
										typeof userDetails[0] !== "undefined" &&
										typeof userDetails[1] !== "undefined" &&
										parseInt(userDetails[0]) !== 0 &&
										parseInt(userDetails[1]) !== 0
									) {
										init();
									} else {
										if (
											window.location.href.indexOf(
												"/index.html"
											) === -1 &&
											window.location.href.indexOf(
												".html"
											) !== -1
										) {
											window.location.href = "/";
										}
									}
								})
								.catch((err) => {
									console.log("Get account failed");
									console.log(err);
								});
						}
					})
					.catch((err) => {
						console.error(
							"Failed to get contract. Are you connected to main net?"
						);
						console.log(err);
						showPopup(
							"#fade",
							"Failed to get contract. Are you connected to main net?"
						);
					});
			}
		}, 10);
	});
}

async function getAccount() {
	return new Promise(async (resolve, reject) => {
		if (
			typeof tronWebGlobal === "undefined" ||
			typeof tronWebGlobal.trx === "undefined"
		) {
			showPopup("#fade", "Tronlink wallet not found");
			reject("Tronlink wallet not found");
		} else {
			tronWebGlobal.trx
				.getAccount()
				.then((currentAccount) => {
					let currentAccountBase58 = tronWebGlobal.address.fromHex(
						currentAccount.__payload__.address
					);
					$("#connectedAccount").html(
						"Connected account: " + currentAccountBase58
					);
					sessionStorage.currentAccount = currentAccountBase58;
					sessionStorage.currentAccountHex = currentAccount.address;
					resolve();
				})
				.catch((err) => {
					try {
						let currentAccountBase58 =
							tronWebGlobal.defaultAddress.base58;
						$("#connectedAccount").html(
							"Connected account: " + currentAccountBase58
						);
						sessionStorage.currentAccount = currentAccountBase58;
						sessionStorage.currentAccountHex =
							tronWebGlobal.address.toHex(currentAccountBase58);
						resolve();
					} catch (e) {
						showPopup("#fade", "No accounts were found");
						reject(e);
					}
				});
		}
	});
}

async function loginButton() {
	// if (window.tronWeb && window.tronWeb.defaultAddress.base58) { //Commented on 1/June/21
	// 	tronWebGlobal = window.tronWeb;
	// } else {
	// 	tronWebGlobal = new TronWeb({
	// 		fullNode: "https://api.trongrid.io/",
	// 		solidityNode: "https://api.trongrid.io/",
	// 		eventServer: "https://api.trongrid.io/",
	// 	});
	// }

	getAccount()
		.then(() => {
			contractGlobal
				.getUserDetails(sessionStorage.currentAccount)
				.call()
				.then((userDetails) => {
					if (
						typeof userDetails !== "undefined" &&
						typeof userDetails[0] !== "undefined" &&
						typeof userDetails[1] !== "undefined" &&
						parseInt(userDetails[0]) !== 0 &&
						parseInt(userDetails[1]) !== 0
					) {
						sessionStorage.isViewOnly = false;
						window.location.href = "/dashboard.html";
					} else {
						showPopup("#fade", "You are not registered");
					}
				})
				.catch((err) => {
					showPopup("#fade", "Login failed");
					console.log(err);
				});
		})
		.catch((err) => {
			console.log("Get account failed");
			console.log(err);
		});
}

async function previewMode() {
	// if (window.tronWeb && window.tronWeb.defaultAddress.base58) { //Commented on 1/June/21
	// 	tronWebGlobal = window.tronWeb;
	// } else {
	// 	tronWebGlobal = new TronWeb({
	// 		fullNode: "https://api.trongrid.io/",
	// 		solidityNode: "https://api.trongrid.io/",
	// 		eventServer: "https://api.trongrid.io/",
	// 	});
	// }

	await tronWebGlobal.setAddress("TRYNUpi1wcxgHciEop6nZ8CRPALmxn6Ms1");
	tronWebGlobal
		.contract()
		.at(contractAddress)
		.then(async (contract) => {
			contractGlobal = contract;
			sessionStorage.isViewOnly = true;

			let manualAddr = $("#manual-addr").val();
			if (manualAddr === "") {
				showPopup(
					"#fade",
					"Enter Address or user ID to enter preview mode"
				);
			} else {
				if (
					manualAddr.length === 42 &&
					manualAddr.indexOf("0x") !== -1
				) {
					sessionStorage.currentAccountHex = manualAddr;
					sessionStorage.currentAccount =
						tronWebGlobal.address.fromHex(manualAddr);
					await tronWebGlobal.setAddress(
						sessionStorage.currentAccount
					);
					window.location.href = "/dashboard.html";
				} else if (manualAddr.length === 34) {
					sessionStorage.currentAccount = manualAddr;
					sessionStorage.currentAccountHex =
						tronWebGlobal.address.toHex(manualAddr);
					await tronWebGlobal.setAddress(
						sessionStorage.currentAccount
					);
					window.location.href = "/dashboard.html";
				} else {
					contractGlobal
						.userAddresses(manualAddr)
						.call()
						.then(async (result) => {
							if (
								result ===
								"410000000000000000000000000000000000000000"
							) {
								console.error("Invalid User ID");
								showPopup("#fade", "Invalid User ID");
							} else {
								sessionStorage.currentAccountHex = result;
								sessionStorage.currentAccount =
									tronWebGlobal.address.fromHex(result);
								await tronWebGlobal.setAddress(
									sessionStorage.currentAccount
								);
								window.location.href = "/dashboard.html";
							}
						})
						.catch((err) => {
							console.error("Failed to get User ID");
							console.log(err);
							showPopup("#fade", "Failed to get User ID");
						});
				}
			}
		})
		.catch((err) => {
			console.error(
				"Failed to get contract. Are you connected to main net?"
			);
			console.log(err);
			showPopup(
				"#fade",
				"Failed to get contract. Are you connected to main net?"
			);
		});
}

async function signup() {
	if (
		typeof tronWebGlobal === "undefined" ||
		typeof tronWebGlobal.trx === "undefined"
	) {
		showPopup("#fade", "Tronlink wallet not found");
	} else {
		if (!isReferredLink) {
			refer = $("#ref-addr").val();
			if (refer === "") {
				refer = 1;
			}
		} else {
			if (refer === "") {
				refer = $("#ref-addr").val() === "" ? 1 : $("#ref-addr").val();
			}
		}

		let r = String(randomIntFromInterval(2046, 4093));

		showPopup("#fadeLoading", "Signing up, please wait...");
		contractGlobal
			.registerUser(refer, r)
			.send({
				feeLimit: 10000000000,
				callValue: 1000 * multiplier,
			})
			.then(async (receipt) => {
				console.log(receipt);
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
							showPopup("#fade", "Sign-up failed");
						} else {
							if (res.ret[0].contractRet === "REVERT") {
								showPopup(
									"#fade",
									"Sign-up failed: Transaction was reversed"
								);
							} else if (res.ret[0].contractRet === "SUCCESS") {
								showPopup("#fade", "Sign-up was successful!");
								getAccount()
									.then(() => {
										sessionStorage.isViewOnly = false;
										window.location.href =
											"/dashboard.html";
									})
									.catch((err) => {
										console.log("Get account failed");
										console.log(err);
									});
							} else {
								console.log(res);
								showPopup(
									"#fade",
									"Sign-up failed: Transaction status not recognized"
								);
							}
						}
					})
					.catch((err) => {
						$("#fadeLoading").popup("hide");
						console.log("checkTransactionStatus ERR" + err);
						showPopup("#fade", "Sign-up failed: " + err);
					});
			})
			.catch((err) => {
				$("#fadeLoading").popup("hide");
				showPopup("#fade", "Sign-up failed");
				console.log(err);
			});
	}
}

function checkTransactionStatus(hash, stack) {
	return new Promise((resolve, reject) => {
		tronWebGlobal.trx
			.getConfirmedTransaction(hash)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				if (err === "Transaction not found" && stack < 5000) {
					checkTransactionStatus(hash, stack + 1)
						.then(resolve)
						.catch(reject);
				} else {
					reject(err);
				}
			});
	});
}

function _init(addr) {
	// $('.control').find('a').attr("href", window.location.origin + "/dashboard.html");
	// $('.partners').find('a').attr("href", window.location.origin + "/partners.html");
	// $('.uplines').find('a').attr("href", window.location.origin + "/uplines.html");
	// $('.lost-profit').find('a').attr("href", window.location.origin + "/lost.html");
	$(".wallet-box")
		.find("p")
		.text(
			addr.substring(0, 7) +
				"..." +
				addr.substring(addr.length - 7, addr.length)
		);
	$(".address-box")
		.find("p")
		.text(
			contractAddress.substring(0, 7) +
				"..." +
				contractAddress.substring(
					contractAddress.length - 7,
					contractAddress.length
				)
		);

	$(".wallet-box")
		.find("div.copy-sec")
		.find("a")
		.attr("href", "https://tronscan.org/#/address/" + addr);
	$(".address-box")
		.find("div.copy-sec")
		.find("a")
		.attr("href", "https://tronscan.org/#/contract/" + contractAddress);

	$(".wallet-box")
		.find("div.copy-sec")
		.find("span")
		.click(() => {
			copyToClipboard(addr);
		});
	$(".address-box")
		.find("div.copy-sec")
		.find("span")
		.click(() => {
			copyToClipboard(contractAddress);
		});
	$(".affilliate-link")
		.find("div.link-box")
		.click(() => {
			copyToClipboard(
				$(".affilliate-link").find("div.link-box").find("p").text()
			);
		});
	$(".display-mobile").click(() => {
		$(".left-item-cover").toggleClass("slide-in-menu");
	});
}

function getUserDetails() {
	contractGlobal
		.getUserDetails(sessionStorage.currentAccount)
		.call()
		.then((result) => {
			$("#idLevel").html(parseInt(result[0]._hex));
			$("#idNum").html(parseInt(result[1]._hex));
			$("#affLink")
				.find("p")
				.text(
					"https://dash.tronmakers.com/?refId=" +
						parseInt(result[1]._hex)
				);
			if (result[1]._hex == 1) {
				isOwner = true;
			}
			buyLevelTrigger(parseInt(result[0]._hex));
		})
		.catch((err) => {
			console.error("Call for Level Failed");
			console.log(err);
		});
}

function buyLevelTrigger(level) {
	switch (level) {
		case 6:
			contractGlobal
				.getUserLevelExpiresAt(sessionStorage.currentAccount, 6)
				.call()
				.then((result) => {
					var dt = new Date(result * 1000);
					var now = new Date();
					var days = parseInt((dt - now) / (60 * 60 * 24 * 1000));
					$("#level6").children().find("p").text("Active");
					isOwner
						? $("#level6").children().find("p.expire").text("")
						: $("#level6")
								.children()
								.find("p.expire")
								.text(days + " days left");
					$("#level6").children().addClass("buyLevelActivated");
				})
				.catch((err) => {
					console.error("Call for Level Expire Failed");
					console.log(err);
				});
		case 5:
			contractGlobal
				.getUserLevelExpiresAt(sessionStorage.currentAccount, 5)
				.call()
				.then((result) => {
					var dt = new Date(result * 1000);
					var now = new Date();
					var days = parseInt((dt - now) / (60 * 60 * 24 * 1000));
					$("#level5").children().find("p").text("Active");
					isOwner
						? $("#level5").children().find("p.expire").text("")
						: $("#level5")
								.children()
								.find("p.expire")
								.text(days + " days left");
					$("#level5").children().addClass("buyLevelActivated");
				})
				.catch((err) => {
					console.error("Call for Level Expire Failed");
					console.log(err);
				});
		case 4:
			contractGlobal
				.getUserLevelExpiresAt(sessionStorage.currentAccount, 4)
				.call()
				.then((result) => {
					var dt = new Date(result * 1000);
					var now = new Date();
					var days = parseInt((dt - now) / (60 * 60 * 24 * 1000));
					$("#level4").children().find("p").text("Active");
					isOwner
						? $("#level4").children().find("p.expire").text("")
						: $("#level4")
								.children()
								.find("p.expire")
								.text(days + " days left");
					$("#level4").children().addClass("buyLevelActivated");
				})
				.catch((err) => {
					console.error("Call for Level Expire Failed");
					console.log(err);
				});
		case 3:
			contractGlobal
				.getUserLevelExpiresAt(sessionStorage.currentAccount, 3)
				.call()
				.then((result) => {
					var dt = new Date(result * 1000);
					var now = new Date();
					var days = parseInt((dt - now) / (60 * 60 * 24 * 1000));
					$("#level3").children().find("p").text("Active");
					isOwner
						? $("#level3").children().find("p.expire").text("")
						: $("#level3")
								.children()
								.find("p.expire")
								.text(days + " days left");
					$("#level3").children().addClass("buyLevelActivated");
				})
				.catch((err) => {
					console.error("Call for Level Expire Failed");
					console.log(err);
				});
		case 2:
			contractGlobal
				.getUserLevelExpiresAt(sessionStorage.currentAccount, 2)
				.call()
				.then((result) => {
					var dt = new Date(result * 1000);
					var now = new Date();
					var days = parseInt((dt - now) / (60 * 60 * 24 * 1000));
					$("#level2").children().find("p").text("Active");
					isOwner
						? $("#level2").children().find("p.expire").text("")
						: $("#level2")
								.children()
								.find("p.expire")
								.text(days + " days left");
					$("#level2").children().addClass("buyLevelActivated");
				})
				.catch((err) => {
					console.error("Call for Level Expire Failed");
					console.log(err);
				});
		case 1:
			contractGlobal
				.getUserLevelExpiresAt(sessionStorage.currentAccount, 1)
				.call()
				.then((result) => {
					var dt = new Date(result * 1000);
					var now = new Date();
					var days = parseInt((dt - now) / (60 * 60 * 24 * 1000));
					$("#level1").children().find("p").text("Active");
					isOwner
						? $("#level1").children().find("p.expire").text("")
						: $("#level1")
								.children()
								.find("p.expire")
								.text(days + " days left");
					$("#level1").children().addClass("buyLevelActivated");
				})
				.catch((err) => {
					console.error("Call for Level Expire Failed");
					console.log(err);
				});
		default:
			if (sessionStorage.isViewOnly === "true") {
				$(".inner-level-box").find("button").addClass("buttonDisabled");
			}
			break;
	}
}

function copyToClipboard(text) {
	navigator.clipboard
		.writeText(text)
		.then(() => {
			showPopup("#fade", "Copied!");
		})
		.catch((err) => {
			showPopup("#fade", "Copy Failed!");
			console.log(err);
		});
}

function showPopup(popup, text) {
	$(popup).find("span").text(text);
	$(popup).popup("show");
}

function menuIcon() {
	$(".left-item-cover").toggleClass("open");
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function logoutClick() {
	sessionStorage.currentAccount = undefined;
	sessionStorage.currentAccountHex = undefined;
	sessionStorage.isViewOnly = false;
	window.location.href = "/";
}
