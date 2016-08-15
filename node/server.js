var fs = require("fs");

var server = require("http").createServer(function(req, res) {
    res.writeHead(200, {"Content-Type":"text/html"});
}).listen(8080);

var io = require("socket.io").listen(server);

var userHash = {};

var total = 0;

io.sockets.on("connection", function (socket) {
    socket.on("connected", function (name) {
        name = htmlspecialchars(name);
        var msg = name + "が入室しました";
        userHash[socket.id] = name;
        io.sockets.emit("publish", {value: msg});
		var date = new Date();
		msg = "[" + date.toString() + "]" + msg;
		fs.appendFile("log.txt", msg, "utf8", function(err) {
			console.log(err);
		});
        total++;
        io.sockets.emit("counter", {value: total});
        console.log(total);
    });

    socket.on("publish", function (data) {
        data.value = htmlspecialchars(data.value);
        data.value = "[" +  userHash[socket.id] + "] " + data.value;
        io.sockets.emit("publish", {value:data.value});
		var date = new Date();
		var msg = "[" + date.toString() + "]" + data.value;
		fs.appendFile("log.txt", msg, "utf8", function(err) {
			console.log(err);
		});
    });

    socket.on("disconnect", function () {
        if (userHash[socket.id]) {
            var msg = userHash[socket.id] + "が退出しました";
            delete userHash[socket.id];
            io.sockets.emit("publish", {value: msg});
			var date = new Date();
			msg = "[" + date.toString() + "]" + msg;
			fs.appendFile("log.txt", msg, "utf8", function(err) {
				console.log(err);
			});
            total--;
            io.sockets.emit("counter", {value: total});
            console.log(total);
        }
    });
});

function htmlspecialchars (str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    return str;
}
