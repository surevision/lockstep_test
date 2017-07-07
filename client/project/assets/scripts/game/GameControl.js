var NetworkWatcher = require("../common/NetworkWatcher");
var EventManager = require("../common/EventManager");
var Events = require("../common/Const").Events;
var Temp = require("../common/Temp");
var handler = require("../common/Common").handler;

var GameStatus = {
    START: "start",
    PAUSE: "pause",
    STOP: "stop"
}
var GameControl = function(spriteControl, spriteRightPad, spriteLeftPad, nodeBall) {
    this.spriteControl = spriteControl;
    this.spriteRightPad = spriteRightPad;
    this.spriteLeftPad = spriteLeftPad;
    this.nodeBall = nodeBall;

    // 检测触摸移动
    this.spriteControl.node.on(cc.Node.EventType.TOUCH_START, handler(this, this.onTouchStart));
    this.spriteControl.node.on(cc.Node.EventType.TOUCH_MOVE, handler(this, this.onTouchMove));

    // 收到帧动作
    EventManager.registerEvent(
        Events.FrameEvent, 
        this, 
        handler(this, this.onFrameEvent)
    );

    this.reset();
}

GameControl.RADIO = 10;

module.exports = GameControl;

var instance = GameControl.prototype;

instance.start = function(angle) {
    this.ballAngle = angle || 0;
    this.gameStatus = GameStatus.START;
};

instance.pause = function() {
    this.gameStatus = GameStatus.PAUSE;
};

instance.stop = function() {
    this.gameStatus = GameStatus.STOP;
};

instance.isStarted = function() {
    return this.gameStatus == GameStatus.START;
};

instance.reset = function() {
    this.ballX = 0;
    this.ballY = 0;
    this.ballAngle = 0; // 球运动方向
    this.ballSpeed = 10 * 1024; // 球速度

    this.stop();
    this.frame = 0;
    this.frameEvents = [];

    this.spriteLeftPad.node.y = 0;
    this.spriteRightPad.node.y = 0;
    this.nodeBall.x = 0;
    this.nodeBall.y = 0;
}

instance.playerArea = function(area) {
    this.area = area;   // 设置玩家位置 0右 1左
}

instance.dispose = function() {
    EventManager.unregisterEvent(this);
};

instance.update = function(dt) {
    // cc.log("update begin");
    var ry = this.spriteRightPad.node.y;
    var ly = this.spriteLeftPad.node.y;
    for (var i = 0; i < this.frameEvents.length; i += 1) {
        var frameEvent = this.frameEvents[i];
        this.frame = frameEvent.frame;
        // cc.log("update frame %s", this.frame);
        // 设置位置
        if(!isNaN(frameEvent.ly) && frameEvent.ly != -1) {
            ly = frameEvent.ly; // 左边玩家位置
        }
        if (!isNaN(frameEvent.ry) & frameEvent.ry != -1) {
            ry = frameEvent.ry; // 右边玩家位置
        }
        // 计算球体运动
        this.nextBall(dt, ry, ly);
    }
    this.spriteLeftPad.node.y = parseInt(ly);
    this.spriteRightPad.node.y = parseInt(ry);
    this.nodeBall.x = this.realBallX();
    this.nodeBall.y = this.realBallY();
    this.frame += 1;
    this.frameEvents = [];  // 清空网络消息
    this.sendFrameEvent();
    // cc.log("update end");
};

instance.setupBall = function(ballX, ballY, ballAngle) {
    this.ballX = ballX;
    this.ballY = ballY;
    this.ballAngle = ballAngle;
}

instance.realBallX = function() {
    return Math.floor(this.ballX / 1024);
};

instance.realBallY = function() {
    return Math.floor(this.ballY / 1024);
};

// 计算球接下来的位置
instance.nextBall = function(dt, ry, ly) {
    this.ballX = this.ballX + this.ballSpeed * Math.cos(this.ballAngle / 180.0 * Math.PI);
    this.ballY = this.ballY + this.ballSpeed * Math.sin(this.ballAngle / 180.0 * Math.PI);
    if (this.realBallX() - GameControl.RADIO <= -this.spriteControl.node.width / 2) {
        // 撞左边
        this.ballX = (-this.spriteControl.node.width / 2 + GameControl.RADIO) * 1024;
        if (this.ballAngle < 180) {
            this.ballAngle = 180 - this.ballAngle;
        } else {
            this.ballAngle = 90 + this.ballAngle;
        }
    }
    if (this.realBallX() + GameControl.RADIO >= this.spriteControl.node.width / 2) {
        // 撞右边
        this.ballX = (this.spriteControl.node.width / 2 - GameControl.RADIO) * 1024;
        if (this.ballAngle < 180) {
            this.ballAngle = 180 - this.ballAngle;
        } else {
            this.ballAngle = this.ballAngle - 90;
        }
    }
    if (this.realBallY() - GameControl.RADIO <= -this.spriteControl.node.height / 2) {
        // 撞下边
        this.ballY = (-this.spriteControl.node.height / 2 + GameControl.RADIO) * 1024;
        this.ballAngle = 360 - this.ballAngle;
    }
    if (this.realBallY() + GameControl.RADIO >= this.spriteControl.node.height / 2) {
        // 撞上边
        this.ballY = (this.spriteControl.node.height / 2 - GameControl.RADIO) * 1024;
        this.ballAngle = 360 - this.ballAngle;
    }
    this.checkPads(ry, ly);
}

// 碰撞检测
instance.checkPads = function(ry, ly) {
    var pads = [this.spriteRightPad, this.spriteLeftPad];
    for (var i = 0; i < pads.length; i += 1) {
        var pad = pads[i];
        var padX = pad.node.x;
        var padY = (i == 0 ? ry : ly);//pad.node.y
        var padW = pad.node.width;
        var padH = pad.node.height;
        if (this.realBallX() >= padX - padW / 2 &&
            this.realBallX() <= padX + padW / 2 &&
            this.realBallY() >= padY - padH / 2 &&
            this.realBallY() <= padY + padH / 2) {
            // 
            if (this.ballAngle < 90 || this.ballAngle > 270) {
                // 撞右边
                if (this.ballAngle < 180) {
                    this.ballAngle = 180 - this.ballAngle;
                } else {
                    this.ballAngle = this.ballAngle - 90;
                }
                this.ballX = (padX - pad.node.width / 2 - GameControl.RADIO) * 1024;
            } else {
                // 撞左边
                if (this.ballAngle < 180) {
                    this.ballAngle = 180 - this.ballAngle;
                } else {
                    this.ballAngle = 90 + this.ballAngle;
                }
                this.ballX = (padX + pad.node.width / 2 + GameControl.RADIO) * 1024;
            }
        }
    }
};

instance.onTouchStart = function() {
    this.lastTouchPos = null;
}

instance.onTouchMove = function(event) {
    // cc.log("onTouchMove");
    var pads = [this.spriteRightPad, this.spriteLeftPad];
    var pad = pads[this.area];
    var touches = event.getTouches();
    var touchLoc = touches[0].getLocation();
    var x = touchLoc.x;
    var y = touchLoc.y;
    this.lastTouchPos = this.lastTouchPos || touchLoc;
    var dx = x - this.lastTouchPos.x;
    var dy = y - this.lastTouchPos.y;
    this.lastTouchPos = cc.p(x, y);
    var _x = pad.node.x;
    var _y = pad.node.y + Math.floor(dy * 5);
    this.collectFrameEvent(cc.p(_x, _y));
};

// 暂不处理掉线重连

// 收到帧行动
instance.onFrameEvent = function(data) {
    // console.log("onFrameEvent");
    this.frameEvents.push(data);
};

instance.collectFrameEvent = function(pos) {
    this.frameEvent = {
        frame: this.frame,
        y: pos.y
    };
};

instance.sendFrameEvent = function() {
    // 发送玩家动作
    if (this.frameEvent) {
        var netEvent = "hall.hallHandler.turn_act";
        NetworkWatcher.send(netEvent, this.frameEvent);
    }
    delete this.frameEvent;
}