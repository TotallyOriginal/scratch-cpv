const CLOUD_PREFIX = "☁ ";

var username = "";
var connections = {};

window.addEventListener('load', function() {
	connect("178657884", 0, function() {});
	connect("178581076", 1, function() {});
});

function transferValues() {
	var msg = document.getElementById("msgDiv");
	username = document.getElementById("unameField").value;
	if(username.length > 0) {
		msg.style.color = "yellow";
		msg.innerHTML = "Syncing values...";
		connections[0].getCloudVar("cloud_var", function(e) {
			connections[1].setCloudVar("cloud_var", e.value);
			msg.innerHTML = "Values successfully synced";
		});
	} else {
		msg.style.color = "red";
		msg.innerHTML = "Please fill in the username field";
	}
}

function connect(pid, id, cb) {
	connections[id] = new WebSocket("wss://clouddata.scratch.mit.edu/", [], {});
	var varNameGet = "";
	var cbGet = null;
	connections[id].pid = pid;
	connections[id].sendPacket = function(method, options) {
		var obj = {
			user: username,
			project_id: "" + pid,
			method: method
		};
		for(var name in options) {
			obj[name] = options[name];
		}
		this.send(JSON.stringify(obj) + "\n");
	};
	connections[id].setCloudVar = function(name, value) {
		this.sendPacket('set', {
			name: CLOUD_PREFIX + name,
			value: "" + value
		});
	};
	connections[id].getCloudVar = function(name, callback) {
		varNameGet = name;
		if(callback) cbGet = callback;
		this.sendPacket('handshake', {});
	};
	connections[id].onopen = function() {
		console.log("Connected to cloud server, project id: " + pid);
		this.sendPacket('handshake', {});
		if(cb) cb();
	};
	connections[id].onclose = function() {
		console.log("Connection closed on project " + pid + "... reconnecting");
		connect(pid, id, cb);
	};
	connections[id].onmessage = function(e) {
		if(varNameGet !== "") {
			var objs = e.data.split("\n");
			var newJSONStr = "[";
			for(i = 0; i < objs.length-1; i++) {
				if(i != objs.length-2)
					newJSONStr += objs[i] + ",";
				else
					newJSONStr += objs[i];
			}
			newJSONStr += "]";
			objs = JSON.parse(newJSONStr);
			var lastReceived = {};
			for(i = 0; i < objs.length; i++) {
				if(objs[i].name === CLOUD_PREFIX + varNameGet)
					lastReceived = objs[i];
			}
			if(cbGet != null) cbGet(lastReceived);
			varNameGet = "";
		}
	};
	connections[id].onerror = function(e) {
		console.log("ERROR: " + e);
	};
	return connections[id];
}