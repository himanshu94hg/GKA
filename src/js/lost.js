function init() {
	$('.loader-section').css('display', 'none');
	showPopup('#fadeLoading', 'Please Wait while the data is loading!');
	getUserDetails();
	getUserLostAmount();
}

function getUserLostAmount() {
	var lostAmountArr = [];
	contractGlobal.getUserLosts(sessionStorage.currentAccount).call().then(function (result) {
		lostAmountArr = result;
		fillLostData(lostAmountArr);
	}).catch(err => {
		$('#fadeLoading').popup('hide');
		showPopup('#fade', 'Call for Lost Amount Failed');
		console.error(err);
	});
}

function fillLostData(arr) {
	$('#fadeLoading').popup('hide');
	for (var i = 0; i < arr[0].length; i++) {
		address = arr[1][i];
		id = arr[0][i];
		level = arr[3][i];
		amount = (arr[2][i] / multiplier).toFixed(2);
		if (screen.width < 767) {
			address = address.substring(0, 5) + '...' + address.substring(address.length - 5, address.length);
		}
		$('<tr><td>' + (i + 1) + '</td><td>' + id + '</td><td>' + level + '</td><td>' + amount + '</td><td>' + address + '</td></tr>').appendTo('.table-content');
	}
}
