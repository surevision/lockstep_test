var EventManager = {
    handlers : {},
    // // 绑定事件
    registerEvent: function(eventId, target, callback) {
        var handlers = EventManager.handlers;
        handlers[eventId] = handlers[eventId] || {};
        handlers[eventId][target] = callback;
    },
    // 解绑事件
    unregisterEvent: function(target) {
        var handlers = EventManager.handlers;
        for (var eventId in handlers) {
            delete(handlers[eventId][target]);
        }
    },
    // 触发事件
    dispatchEvent: function(eventId, data) {
        var handlers = EventManager.handlers;
        for(var target in handlers[eventId]) {
            handlers[eventId][target](data);
            // handlers[eventId][target].bind(target);
            // handlers[eventId][target].call(target, data);
        }
    }

}

module.exports = EventManager;