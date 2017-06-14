var hallRemote = require('../remote/hallRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
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
	var param = {
		rooms: rooms
	};
	channel = channelService.getChannel(rid, false);
	var tuid = username + '*' + rid;
	var tsid = channel.getMember(tuid)['sid'];
	channelService.pushMessageByUids('dse_update_hall', param, [{
		uid: tuid,
		sid: tsid
	}]);
	next(null, {
		route: msg.route
	});
};