referrals = {}
refArr = []
counter = 1;
let root = {};
outerFlag = false;

function init() {
	$('.loader-section').css('display', 'none');
	getUserDetails();
	makeRoot(11).then();
}

async function makeRoot(depth) {
	showPopup('#fadeLoading', 'Please wait while the data is loading!');
	try {
		let rootUser = await contractGlobal.getUser(sessionStorage.currentAccount).call();
		let rootUserDetails = await contractGlobal.getUserDetails(sessionStorage.currentAccount).call();
		rootUser['id'] = rootUser[0];
		rootUser['depth'] = 1;
		rootUser['parentId'] = rootUser[1];
		rootUser['name'] = rootUser[0] + "(Lev - " + rootUserDetails[0] + ")";

		let rootArray = [rootUser];
		let rootList = [rootUser];
		while (rootArray.length !== 0) {
			let currentUser = rootArray.pop();
			let childAddress = currentUser[2];
			for (let i = 0; i < childAddress.length; i++) {
				if (currentUser['depth'] < depth) {
					let childUser = await contractGlobal.getUser(childAddress[i]).call();
					let childUserDetails = await contractGlobal.getUserDetails(childAddress[i]).call();
					childUser['id'] = childUser[0];
					childUser['depth'] = currentUser['depth'] + 1;
					childUser['parentId'] = childUser[1];
					childUser['name'] = childUser[0] + "(Lev - " + childUserDetails[0] + ")";
					rootArray.push(childUser);
					rootList.push(childUser);
				}
			}
		}

		var map = {}, node, roots = [], i;
		for (i = 0; i < rootList.length; i += 1) {
			map[rootList[i].id] = i;
			rootList[i].children = [];
		}

		for (i = 0; i < rootList.length; i += 1) {
			node = rootList[i];

			if (node.parentId !== rootUser['parentId']) {
				rootList[map[node.parentId]].children.push(node);
			} else {
				roots.push(node);
			}
		}

		root = roots[0];
		makeChart();
		$('#fadeLoading').popup('hide');
	} catch (err) {
		$('#fadeLoading').popup('hide');
		showPopup('#fade', 'Failed to make Chart of Partners, try again Later!');
		console.error(err);
	}
}

function makeChart() {
	$('#fadeLoading').popup('hide');
	var margin = {
			top: 20,
			right: 120,
			bottom: 20,
			left: 120
		},
		width = 960 - margin.right - margin.left,
		height = 800 - margin.top - margin.bottom;

	var i = 0,
		duration = 750,
		rectW = 60,
		rectH = 30;

	var tree = d3.layout.tree().nodeSize([70, 40]);
	var diagonal = d3.svg.diagonal()
		.projection(function (d) {
			return [d.x + rectW / 2, d.y + rectH / 2];
		});

	widthParent = document.getElementById('partners').offsetWidth;

	var svg = d3.select("#partners").append("svg").attr("width", "100%").attr("height", "100%")
		.call(zm = d3.behavior.zoom().scaleExtent([1, 3]).on("zoom", redraw)).append("g")
		.attr("transform", "translate(" + (widthParent - 60) / 2 + "," + 20 + ")");

	//necessary so that zoom knows where to zoom and unzoom from
	zm.translate([350, 20]);

	root.x0 = 0;
	root.y0 = height / 2;

	function collapse(d) {
		if (d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}

	root.children.forEach(collapse);
	update(root);

	d3.select("#partners").style("height", "800px");

	function update(source) {

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse(),
			links = tree.links(nodes);

		// Normalize for fixed-depth.
		nodes.forEach(function (d) {
			d.y = d.depth * 180;
		});

		// Update the nodes…
		var node = svg.selectAll("g.node")
			.data(nodes, function (d) {
				return d.id || (d.id = ++i);
			});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function (d) {
				return "translate(" + source.x0 + "," + source.y0 + ")";
			})
			.on("click", click);

		nodeEnter.append("rect")
			.attr("width", rectW)
			.attr("height", rectH)
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.style("fill", function (d) {
				return d._children ? "lightsteelblue" : "#fff";
			});

		nodeEnter.append("text")
			.attr("x", rectW / 2)
			.attr("y", rectH / 2)
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function (d) {
				return d.name;
			});

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

		nodeUpdate.select("rect")
			.attr("width", rectW)
			.attr("height", rectH)
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.style("fill", function (d) {
				return d._children ? "lightsteelblue" : "#fff";
			});

		nodeUpdate.select("text")
			.style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + source.x + "," + source.y + ")";
			})
			.remove();

		nodeExit.select("rect")
			.attr("width", rectW)
			.attr("height", rectH)
			//.attr("width", bbox.getBBox().width)""
			//.attr("height", bbox.getBBox().height)
			.attr("stroke", "black")
			.attr("stroke-width", 1);

		nodeExit.select("text");

		// Update the links…
		var link = svg.selectAll("path.link")
			.data(links, function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("x", rectW / 2)
			.attr("y", rectH / 2)
			.attr("d", function (d) {
				var o = {
					x: source.x0,
					y: source.y0
				};
				return diagonal({
					source: o,
					target: o
				});
			});

		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
			.duration(duration)
			.attr("d", function (d) {
				var o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o
				});
			})
			.remove();

		// Stash the old positions for transition.
		nodes.forEach(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	// Toggle children on click.
	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	//Redraw for zoom
	function redraw() {
		//console.log("here", d3.event.translate, d3.event.scale);
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			+ " scale(" + d3.event.scale + ")");
	}

}
