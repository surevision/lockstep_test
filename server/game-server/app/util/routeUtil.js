var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
	var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('rid'), chatServers);

	cb(null, res.id);
};

exp.hall = function(session, msg, app, cb) {
	var hallServers = app.getServersByType('hall');

	if(!hallServers || hallServers.length === 0) {
		cb(new Error('can not find hall servers.'));
		return;
	}

	cb(null, hallServers[0].id); // first hall server.
};