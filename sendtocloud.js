const CLOUD_PREFIX = "☁ ";

var username = "";
var connections = {};  //Array of WebSockets

window.addEventListener('load', function() {
	connect("178657884", 0, function() {}); //WebSocket 0, connects to first project
	connect("178581076", 1, function() {}); //WebSocket 1, connects to second project
});

function transferValues() {
	var msg = document.getElementById("msgDiv");
	username = document.getElementById("unameField").value;
	if(username.length > 0) {
		msg.style.color = "yellow";
		msg.innerHTML = "Syncing values...";
		connections[0].getCloudVar("cloud_var", function(e) { //Gets the value of cloud_var from project 0
			connections[1].setCloudVar("cloud_var", e.value); //Sets the value of cloud_var in project 1
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
	connections[id].pid = pid; //pid = Project ID
	connections[id].sendPacket = function(method, options) {
		var obj = {
			user: username,
			project_id: "" + pid,
			method: method
		};
		for(var name in options) {
			obj[name] = options[name];
		}
		this.send(JSON.stringify(obj) + "\n"); //Send request through WebSocket
	};
	connections[id].setCloudVar = function(name, value) { //Sets a cloud variable
		this.sendPacket('set', {
			name: CLOUD_PREFIX + name,
			value: "" + value
		});
	};
	connections[id].getCloudVar = function(name, callback) { //Gets a cloud variable
		varNameGet = name;
		if(callback) cbGet = callback;
		this.sendPacket('handshake', {});
	};
	connections[id].onopen = function() { //When we connect to the cloud server
		console.log("Connected to cloud server, project id: " + pid);
		this.sendPacket('handshake', {});
		if(cb) cb();
	};
	connections[id].onclose = function() { //When the conenction closes (mainly due to inactivity)
		console.log("Connection closed on project " + pid + "... reconnecting");
		connect(pid, id, cb); //Reconnect on close
	};
	connections[id].onmessage = function(e) { //Used for getting cloud var values
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