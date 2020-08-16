var Dict = require("collections/dict");

var express=require('express');
var app = express();
var path=require('path');
var server = require('http').createServer(app);
var io=require('socket.io')(server);
//Initialize application with route
app.use(express.static('public/'));

var games = new Dict();
var gamesStart = new Dict();
io.on('connect', socket => {
		socket.on('gameRoomCheck', data => {
			if(gamesStart[data[1]] != undefined){
				var current = new Date();
				var diff =(current.getTime() - gamesStart[data[1]].getTime()) / 1000;			
				if(diff > 200){
					delete gamesStart[data[1]];
					delete games[data[1]];
				}
			}
		if(!(data[1] in games)){
			games[data[1]] = [data[0]];
			io.to(data[0]).emit('status', 'chill');
		}else if(games[data[1]].length == 1){
			games[data[1]].push(data[0]);
			io.to(games[data[1]][1]).emit('go', -1);
			io.to(games[data[1]][0]).emit('go', 1);
			gamesStart[data[1]] = new Date();
		} else {
			io.to(data[0]).emit('status', 'taken');
		}
	});
	socket.on('gamePlay', (user, room, cell) => {
		io.to(games[room][1]).emit("game", cell)
		io.to(games[room][0]).emit("game", cell)
	});
	socket.on('gameOver', (room) => {
		delete games[room];
		delete gamesStart[room];
	});
});
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
	console.log('go to http://localhost:' + PORT);
});