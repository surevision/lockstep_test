module.exports = function(app) {
	return new HallRemote(app);
};

var HallRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
	this.rooms = [];
	var roomMax = 10;
	for (var i = 0; i < roomMax; i += 1) {
		var room = {
			index: i,
			roomData: {
				l: "",
				r: ""
			}
		}
		this.rooms.push(room);
	}
};

/**
 * Add user into Hall channel.
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
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
	}
	var username = uid.split('*')[0];
	var param = {
		route: 'onLeave',
		user: username
	};
	channel.pushMessage(param);
	cb();
};
