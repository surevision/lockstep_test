var Room = require("../room/room");

var hallInstance = null;

var Instance = function(app) {
	this.app = app;
	this.rooms = [];
};

module.exports = Instance;

Instance.prototype.getInstance = function(app) {
	if (!hallInstance) {
		hallInstance = new Instance(app);
		// 初始化所有房间
		var roomMax = 10;
		for (var i = 0; i < roomMax; i += 1) {
			var room = Room.create(i);
			this.rooms.push(room);
		}
	}
	return hallInstance;
};