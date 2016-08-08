var fs = require("fs");

var server = require("http").createServer(function(req, res) {
    res.writeHead(200, {"Content-Type":"text/html"});
}).listen(8080);

var io = require("socket.io").listen(server);

var userHash = {};

io.sockets.on("connection", function (socket) {
    socket.on("connected", function (name) {
        var msg = name + "が入室しました";
        userHash[socket.id] = name;
        io.sockets.emit("publish", {value: msg});
    });

    socket.on("publish", function (data) {
        io.sockets.emit("publish", {value:data.value});
    });

    socket.on("disconnect", function () {
        if (userHash[socket.id]) {
            var msg = userHash[socket.id] + "が退出しました";
            delete userHash[socket.id];
            io.sockets.emit("publish", {value: msg});
        }
    });
});
