
var userDao = require("../../../dao/userDao");

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	checkUserInfo(msg.username, msg.password, function(err, dbUid) {
		if(err) {
			next(null, {
				code: 501,
				error: "check user info failed!"
			});
			return;
		}
		var rid = msg.rid;
		var uid = msg.username + '*' + dbUid // 绑定为数据库uid
		var sessionService = self.app.get('sessionService');

		//duplicate log in
		if( !! sessionService.getByUid(uid)) {
			next(null, {
				code: 500,
				error: "user already logged in!"
			});
			return;
		}

		session.bind(uid);
		session.set('rid', rid);
		session.push('rid', function(err) {
			if(err) {
				console.error('set rid for session service failed! error is : %j', err.stack);
			}
		});
		session.on('closed', onUserLeave.bind(null, self.app));

		//put user into channel
		//console.log(self.app);
		self.app.rpc.hall.hallRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
			next(null, {
				code: 0,
				users: users
			});
		});
	})
};

var checkUserInfo = function(username, password, cb) {
	userDao.getUserInfo(username, password, function(err, userInfo) {
		console.log("userInfo", userInfo);
		if (err) {
			cb(err);
			return;
		}
		if (userInfo.uid == 0) {
			err = "no user!";
			cb(err);
			return;
		}
		if (userInfo.password != password) {
			err = "password err!";
			cb(err);
			return;
		}
		cb(userInfo.uid);
	});
}

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
	app.rpc.hall.hallRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};