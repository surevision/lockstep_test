var pomelo = require("pomelo");

var GameRoom = function(room) {
	this.room = room;
	this.ballAngle = 45;
	this.reset();
};

var handler = function(target, callback) {
	return function() {
		callback.apply(target, arguments);
	}
};

var GameRooms = {};

GameRoom.createRoom = function(room) {
	if (GameRooms[room.rid]) {
		return GameRooms[room.rid];
	}
	var gameRoom = new GameRoom(room);
	GameRooms[room.rid] = gameRoom;
	return gameRoom;
};

GameRoom.get = function(rid) {
	return GameRooms[rid];
};

GameRoom.dispose = function(rid) {
	if (GameRooms[rid]) {
		GameRooms[rid].stop();
		GameRooms[rid] = null;
	}
}

module.exports = GameRoom;

var instance = GameRoom.prototype;

instance.reset = function() {
	if (this.timer) {
		clearInterval(this.timer);
	}
	this.ready = 0;
	this.timer = null;
	this.frame = 0;
	this.clearEvents();
};

instance.start = function() {
	this.timer = setInterval(handler(this, this.tick), 1.0 / 30 * 1000);
};

instance.stop = function() {
	this.reset();
};

instance.tick = function() {
	// 
	var channelService = pomelo.app.get('channelService');
	var channel = channelService.getChannel(this.room.rid, false);
	this.frame += 1;
	var param = {
		frame: this.frame,
		ry: this.actEvents[0].posY,
		ly: this.actEvents[1].posY
	};
	channel.pushMessage('dse_turn_act', param);
	this.clearEvents();
};

instance.isReady = function() {
	console.log("this.ready: %d", this.ready);
	return this.ready == 2;
};

instance.clearEvents = function() {
	this.actEvents = [
		{posY: -1},	// rightY
		{posY: -1}	// leftY
	];
};

// 接收指令
instance.addAct = function(y, area) {
	this.actEvents[area].posY = y;
};