var NetworkWatcher = require("../common/NetworkWatcher");
var EventManager = require("../common/EventManager");
var Events = require("../common/Const").Events;
var Temp = require("../common/Temp");
var handler = require("../common/Common").handler;

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        titleLabel: cc.Label,
        leftPlayerLabel: cc.Label,
        rightPlayerLabel: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        EventManager.registerEvent(Events.Disconnected, this, handler(this, this.returnToLogin));
        EventManager.registerEvent(Events.UpdateRoomInfo, this, handler(this, this.updateRoom));
        EventManager.registerEvent(Events.UpdateRoomPlayers, this, handler(this, this.updatePlayers));
        EventManager.registerEvent(Events.ExitRoom, this, handler(this, this.exitRoom));

        this.players = {
            left: {},
            right: {}
        }
        this.selfArea = 0;    // 0 right, 1 left
        this.roomId = 0;
        this.requestRoomInfo();
    },

    onDestroy: function() {
        EventManager.unregisterEvent(this);
    },

    returnToLogin: function(data) { // 断线
        cc.director.loadScene("Login");
    },

    requestRoomInfo: function() {
        // TODO: 请求进入房间应该放到hall中处理
        cc.log("requestRoomInfo");
        var self = this;
        var netEvent = "hall.hallHandler.enter_room";
        NetworkWatcher.send(netEvent, {rid: Temp.rid}, function(data) {
            if (data.error) {
                cc.log(data.error);
            }
        });
    },

    setRoomId: function(rid) {
        this.roomId = rid;
        this.titleLabel.string = cc.js.formatStr("ROOM %s", rid);
    },

    updateRoom: function(data) {
        cc.log(data);
        this.setRoomId(data.room.rid);
        this.updatePlayers({room:data.room});
        this.selfArea = data.sa
    },

    updatePlayers: function(data) {
        var room = data.room;
        this.players.left = room.l,
        this.players.right = room.r;
        this.leftPlayerLabel.string = cc.js.formatStr("%s", (room.l ? room.l : "empty"));
        this.rightPlayerLabel.string = cc.js.formatStr("%s", (room.r ? room.r : "empty"));
    },

    onClickExit: function() {
        this.exitRoom();
    },

    exitRoom: function() {
        if (this.roomId != 0) {
            var self = this;
            var netEvent = "hall.hallHandler.exit_room";
            NetworkWatcher.send(netEvent, {rid: Temp.rid}, function(err, data) {
                cc.log("exitRoom", data);
                cc.director.loadScene("Hall");
            });
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
