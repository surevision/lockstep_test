var pomelo = require("pomelo");
var hallRemote = require('../remote/hallRemote');
var hallDomain = require("../../../domain/hall/hall");

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * 取房间列表
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.rooms = function(msg, session, next) {
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var hall = hallDomain.getInstance(pomelo.app);
	var rooms = hall.rooms;
	var param = {
		rooms: rooms
	};
	channel = channelService.getChannel(rid, false);
	var tuid = session.uid;
	var tsid = channel.getMember(tuid)['sid'];
	channelService.pushMessageByUids('dse_update_hall', param, [{
		uid: tuid,
		sid: tsid
	}]);
	// channel.pushMessage('dse_update_hall', param);
	next(null, {
		route: msg.route
	});
};

/*
 * 加入房间
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
*/
handler.enter_room = function(msg, session, next) {
	var rid = parseInt(msg.rid);	// 要加入的房间号
	var username = session.uid.split('*')[0];
	if (isNaN(rid)) {
		var error = "invaild rid!";
		console.error(error);
		next(null, {
			code: 1,
			error: error
		});
		return;
	}
	var channelService = pomelo.app.get('channelService');
	var hall = hallDomain.getInstance(pomelo.app);
	var rooms = hall.rooms;
	var room = rooms[rid - 1];
	if (room.l && room.l != "" && room.r && room.r != "") {
		// 房间人满
		var error = "room is full!";
		console.error(error);
		next(null, {
			code: 2,
			error: error
		});
		return;
	}
	// 修改玩家channel号
	var channel = channelService.getChannel(session.get('rid'), false);
	var sid = channel.getMember(session.uid)['sid'];
	// 从大厅channel中移除
	if( !! channel) {
		channel.leave(session.uid, sid);
	}
	// 加入房间channel
	channel = channelService.getChannel(msg.rid, true);
	channel.add(session.uid, sid);
	// 重设session中记录的房间号
	session.set('rid', msg.rid);
	session.push('rid');
	// 更新room数据
	var selfArea = 0;	// 自己的位置 0:右 1:左
	if (room.r == "") {
		room.r = username;
	} else {
		selfArea = 1;
		room.l = username;
	}
	console.log(room);
	// 通知该玩家房间信息
	var param = {
		sa: selfArea,
		room: room
	}
	var tuid = session.uid;
	var tsid = channel.getMember(tuid)['sid'];
	channelService.pushMessageByUids('dse_room_info', param, [{
		uid: tuid,
		sid: tsid
	}]);
	// 通知房间内所有玩家更新房间数据 TODO: 该玩家会更新2次，可以优化
	param = {
		room: room
	}
	channel.pushMessage('dse_room_players', param);
	// 通知大厅内的玩家房间列表变化
	param = {
		rooms: rooms
	};
	var hallChannelId = 0;
	channel = channelService.getChannel(hallChannelId, true);
	channel.pushMessage('dse_update_hall', param);
	next(null, {
		code: 0,
		room: room
	});
};


/*
 * 退出房间
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
*/
handler.exit_room = function(msg, session, next) {
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = pomelo.app.get('channelService');
	var hall = hallDomain.getInstance(pomelo.app);
	var rooms = hall.rooms;
	var room = rooms[rid - 1];

	// 修改玩家channel号
	var channel = channelService.getChannel(rid, false);
	var sid = channel.getMember(session.uid)['sid'];
	// 从房间hannel中移除
	if( !! channel) {
		channel.leave(session.uid, sid);
	}
	// 更新room数据
	if (room.r == username) {
		room.r = "";
	} else {
		room.l = "";
	}
	// 通知原房间中其他玩家
	var param = {
		room: room
	}
	channel.pushMessage('dse_room_players', param);
	// 通知大厅内的玩家房间列表变化
	param = {
		rooms: rooms
	};
	var hallChannelId = 0;
	channel = channelService.getChannel(hallChannelId, true);
	channel.pushMessage('dse_update_hall', param);

	// 加入大厅channel
	channel = channelService.getChannel(hallChannelId, false);
	channel.add(session.uid, sid);
	// 重设session中记录的房间号
	session.set('rid', hallChannelId);
	session.push('rid');

	next(null, {
		code: 0
	});
};