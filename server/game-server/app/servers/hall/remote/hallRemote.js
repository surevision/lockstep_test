var pomelo = require("pomelo");
var hallDomain = require("../../../domain/hall/hall");

var GameRoom = require("../../../domain/room/gameRoom");

module.exports = function(app) {
	return new HallRemote(app);
};

var HallRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into Hall.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
HallRemote.prototype.add = function(uid, sid, name, flag, cb) {
	var channel = this.channelService.getChannel(name, flag);
	var username = uid.split('*')[0];
	var param = {
		route: 'onAdd',
		user: username
	};
	channel.pushMessage(param);

	if( !! channel) {
		channel.add(uid, sid);
	}

	cb(this.get(name, flag));
};

/**
 * Get user from Hall channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
HallRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0];
	}
	return users;
};

/**
 * Kick user out Hall channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
HallRemote.prototype.kick = function(uid, sid, name, cb) {
	var rid = name;
	console.log("================= kick %s ================", name);
	// 通知大厅内的玩家房间列表变化
	var hall = hallDomain.getInstance(pomelo.app);
	var rooms = hall.rooms;
	// leave channel
	var channel = this.channelService.getChannel(name, false);
	if( !! channel) {
		channel.leave(uid, sid);
	}
	// 如果在房间中，通知其他玩家房间状态修改
	var room = rooms[rid - 1];
	if (!room) {
		cb();
		return;
	}
	// 如果在游戏中，游戏结束
	var gameRoom = GameRoom.get(rid);
	if (gameRoom) {
		GameRoom.dispose(rid);
	}
	var username = uid.split('*')[0];
	// 更新room数据
	if (room.r == username) {
		room.r = "";
	} else {
		room.l = "";
	}
	// 通知房间内玩家更新房间信息
	var param = {
		room: room
	}
	channel = this.channelService.getChannel(rid, false);
	channel.pushMessage('dse_room_players', param);
	// 通知的大厅内的玩家更新房间列表
	param = {
		rooms: rooms
	};
	var hallChannelId = 0;
	channel =  this.channelService.getChannel(hallChannelId, true);
	channel.pushMessage('dse_update_hall', param);

	var username = uid.split('*')[0];
	var param = {
		route: 'onLeave',
		user: username
	};
	channel.pushMessage(param);	// 广播给其他玩家
	cb();
};
