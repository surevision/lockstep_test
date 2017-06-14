var EventManager = require("../common/EventManager");
var Events = require("../common/Const").Events;
var NetworkWatcher = require("../common/NetworkWatcher");
var Common = require("../common/Common");

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
        usernameEdit: {
            type: cc.EditBox,
            default: null
        },
        passwordEdit: {
            type: cc.EditBox,
            default: null
        }
    },

    // use this for initialization
    onLoad: function () {
        EventManager.registerEvent(Events.EnterHall, this, this.enterHall);
    },

    onDestroy: function() {
        EventManager.unregisterEvent(this);
    },

    enterHall: function() {
        cc.director.loadScene("Hall");
    },

    // sign in
    onSignIn: function() {
        var self = this;
        var username = this.usernameEdit.string;
        var password = this.passwordEdit.string;
        cc.log(username, password);
        var ip = "127.0.0.1";
        var port = 3014;
        var rid = 0;    // 未进入房间的channel
        NetworkWatcher.connect(ip, port, username, password, rid, function(err){
            cc.log(err);
        });
    },

    // sign up new user
    onSignUp: function() {
        var self = this;
        var username = this.usernameEdit.string;
        var password = this.passwordEdit.string;
        cc.log(username, password);
        var url = "http://localhost/lockstep/index.php/Home/Index/signup";
        var data = {
            username: username,
            password: password
        };
        Common.XMLHTTPRequest(url, data, function(response) {
            cc.log(response.status, response.responseText);
        }, Common.POST);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
