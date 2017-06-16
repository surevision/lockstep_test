var NetworkWatcher = require("../common/NetworkWatcher");
var EventManager = require("../common/EventManager");
var Events = require("../common/Const").Events;
var handler = require("../common/Common").handler;
var Temp = require("../common/Temp");

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
        scrollView: {
            default: null,
            type: cc.ScrollView
        },

        itemTemplate: {
            default: null,
            type: cc.Node
        },

        spacing: 10,

        // 当前房间数
        totalCount: {
            default: 0,
            visible: false
        }
    },

    // use this for initialization
    onLoad: function () {
        EventManager.registerEvent(Events.Disconnected, this, handler(this, this.returnToLogin));
        EventManager.registerEvent(Events.UpdateHall, this, handler(this, this.updateHall));
        this.roomItems = [];
        this.requestRooms(); // 请求房间信息
        cc.log(this.itemTemplate);
        this.itemTemplate.getComponent(cc.Label).enabled = false;
    },

    onDestroy: function() {
        EventManager.unregisterEvent(this);
    },

    requestRooms: function() {
        var netEvent = "hall.hallHandler.rooms";
        NetworkWatcher.send(netEvent, {}, function(data) {
            //cc.log(data);
        });
    },

    enterRoom: function(rid) {
        cc.log("enterRoom");
        Temp.rid = rid;
        cc.director.loadScene("Room");
    },

    returnToLogin: function(data) { // 断线
        cc.director.loadScene("Login");
    },

    updateHall: function(data) {
        cc.log(data.rooms);
        if (this.totalCount < data.rooms.length) {
            // 补充创建房间节点
            for (var i = this.totalCount; i < data.rooms.length; i += 1) {
                this.addRoom(i);
            }
        }
        for(var i = 0; i < this.totalCount; i += 1) {
            this.updateRoom(i, data.rooms[i]);
        }
    },
    // 添加房间
    addRoom: function(index) {
        this.totalCount += 1;
        this.scrollView.content.height = this.totalCount * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        var item = cc.instantiate(this.itemTemplate);
        this.scrollView.content.addChild(item);
        item.x = -item.parent.width / 2;
        item.y = -item.height * (0.5 + index) - this.spacing * (index + 1);
        this.roomItems[index] = item;
    },
    // 更新房间信息
    updateRoom: function(index, roomData) {
        // cc.log("updateRoom %d", index + 1, roomData);
        var item = this.roomItems[index];
        if (!item) {
            return;
        }
        var label = item.getComponent(cc.Label);
        if (!!roomData) {
            var l = roomData.l ? roomData.l : " empty ";
            var r = roomData.r ? roomData.r : " empty ";
            label.string = cc.js.formatStr("ROOM %s: %s / %s", roomData.rid, l, r) ;
            label.enabled = true;
            item.roomData = roomData;
            item.on("touchend", handler(this, this.onClickEnterRoom));
        } else {
            label.enabled = false;
            delete item.roomData;
        }
    },

    onClickEnterRoom: function(event) {
        var target = event.target;
        cc.log(target);
        this.enterRoom(target.roomData.rid);
        event.stopPropagation();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
