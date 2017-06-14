var EventManager = require("EventManager");
var Events = require("Const").Events;
var NetworkWacher = {
    // 监听pomelo事件
    init: function() {
        pomelo.on("dse_update_hall", function(data) {
            EventManager.dispatchEvent(Events.UpdataHall, data);
        });
    },
    // 连接pomelo服务器
    connect: function(ip, port, username, password, rid) {
        var route = 'gate.gateHandler.queryEntry';
        var realEnter = function(ip, port) { // 实际进入
                var route = "connector.entryHandler.enter";
				pomelo.request(route, {
					username: username,
					password: password,
					rid: rid
				}, function(data) {
					if(data.error) {
						cc.error(data);
						return;
					}
                    EventManager.dispatchEvent(Events.EnterHall);
				});
        };
        pomelo.init({
            host: ip,
            port: port,
            log: true
        }, function() {
            pomelo.request(route, {
                uid: uid
            }, function(data) {
                pomelo.disconnect();
                if(data.code === 500) {
                    showError(LOGIN_ERROR);
                    return;
                }
                realEnter(data.host, data.port);
            });
        });
    },
    // 发送pomelo消息
    send: function(netEvent, data, cb) {
        cc.log("send event: %s", netEvent, data);
        Pomelo.request(netEvent, data, cb);
    }
}

module.exports = NetworkWacher;