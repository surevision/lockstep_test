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
