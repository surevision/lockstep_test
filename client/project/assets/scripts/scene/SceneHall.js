var NetworkWatcher = require("../common/NetworkWatcher");
var EventManager = require("../common/EventManager");
var Events = require("../common/Const").Events;

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
        totalRooms: {
            default: 0,
            visible: false
        }
    },

    // use this for initialization
    onLoad: function () {
        EventManager.registerEvent(Events.UpdateHall, this, this.updateHall);
        this.roomItems = [];
        this.requestRooms(); // 请求房间信息
    },

    onDestroy: function() {
        EventManager.unregisterEvent(this);
    },

    requestRooms: function() {
        var netEvent = "hall.hallHandler.rooms";
        NetworkWatcher.send(netEvent, {}, function(data) {
            cc.log(data);
        });
    },

    updateHall: function(data) {
        if (this.totalRooms < data.rooms.length) {
            // 补充创建房间节点
            for (var i = this.totalRooms; i < data.rooms.length; i += 1) {
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
        item.enabled = true;
        item.y = -item.height * (0.5 + index) - this.spacing * (index + 1);
        this.scrollView.content.addChild(item);
        this.roomItems[index] = item;
    },
    // 更新房间信息
    updateRoom: function(index, roomData) {
        var item = this.roomItems[index];
        if (!!roomData) {
            item.string = cc.js.formatStr("ROOM %s: %s / %s", index, roomData.l, roomData.r) ;//"ROOM " + index + ": " + roomData.l + "/" + roomData.r;
        } else {
            item.enabled = false;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
