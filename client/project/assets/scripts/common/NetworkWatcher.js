var pomelo = window.pomelo;
var EventManager = require("EventManager");
var Events = require("Const").Events;
var NetworkWatcher = {
    // 监听pomelo事件
    init: function() {
        pomelo.on("dse_update_hall", function(data) {
            EventManager.dispatchEvent(Events.UpdataHall, data);
        });
    },
    // 连接pomelo服务器
    connect: function(ip, port, username, password, rid, callback) {
        var route = 'gate.gateHandler.queryEntry';
        var realEnter = function(ip, port) { // 实际进入
            var route = "connector.entryHandler.enter";
            pomelo.init({
                host: ip,
                port: port,
                log: true
            }, function() {
                pomelo.request(route, {
                    username: username,
                    password: password,
                    rid: rid
                }, function(data) {
                    if(data.error) {
                        callback(data);
                        return;
                    }
                    EventManager.dispatchEvent(Events.EnterHall);
                });
            });
        };
        pomelo.init({
            host: ip,
            port: port,
            log: true
        }, function() {
            pomelo.request(route, {
                username: username
            }, function(data) {
                pomelo.disconnect();
                if(data.code != 200) {
                    callback(data);
                    return;
                }
                realEnter(data.host, data.port);
            });
        });
    },
    // 发送pomelo消息
    send: function(netEvent, data, cb) {
        cc.log("send event: %s", netEvent, data);
        pomelo.request(netEvent, data, cb);
    }
}

module.exports = NetworkWatcher;