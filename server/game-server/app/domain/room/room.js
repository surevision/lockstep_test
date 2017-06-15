var Instance = function(rid) {
	this.rid = rid;
	this.l = "";
	this.r = "";
};

module.exports = Instance;

Instance.create = function(rid) {
	var room = new Instance(rid);
	return room;
};

Instance.prototype.isFull = function() {
	return this.l && this.l != "" && this.r && this.r != "";
};

Instance.prototype.getLeftPlayer = function() {
	return this.l;
};

Instance.prototype.getRightPlayer = function() {
	return this.r;
};
Instance.prototype.setLeftPlayer = function(username) {
	this.l = username;
};

Instance.prototype.setRightPlayer = function(username) {
	this.r = username;
};

Instance.prototype.removeLeftPlayer = function() {
	this.l = "";
};

Instance.prototype.removeRightPlayer = function(username) {
	this.r = "";
};