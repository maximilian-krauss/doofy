var _ = require('lodash'),
    io = require('socket.io-client'),
    Rx = require('rx'),
    RxNode = require('rx-node'),
    c = require('colors');

var _socket;

function ChatClient(url) {
  this.url = url;
  this.socket = undefined;
  this.account = undefined;
}

var _getCurrentRooms = function(socket, callback) {
  socket.emit('rooms:list', function(rooms) {
    callback(rooms);
  });
};

var _getFurtherRooms = function(socket, callback) {
  socket.on('rooms:new', function(room) {
    callback([ room ]);
  });
};

var _hasBeenMentioned = function(account, message) {
  return message.text.indexOf(account.username) > -1;
};

ChatClient.prototype.rooms = function() {
  var getCurrentRoomsRx = Rx.Observable.fromCallback(_getCurrentRooms);
  var getFurtherRoomsRx = Rx.Observable.fromCallback(_getFurtherRooms);

  return Rx.Observable.concat(
    getCurrentRoomsRx(this.socket),
    getFurtherRoomsRx(this.socket)
  );
};

ChatClient.prototype.subscribeToRooms = function(rooms) {
  var that = this;

  _.forEach(rooms, function(room) {
    that.socket.emit('rooms:join', room.id, function(room) {
      console.log('> Doofy joined:'.gray, room.name.gray);
    });
  });
};

ChatClient.prototype.newMessages = function() {
  var that = this;

  return Rx.Observable.create(function(obs) {
    that.socket.on('messages:new', function(message) {
      if(message.owner.id === that.account.id) {
        return;
      }

      obs.onNext({
        message: message,
        mentioned: _hasBeenMentioned(that.account, message),
        you: that.account,
        respond: function(responseMessage) {
          that.sendMessage(responseMessage, message.room.id);
        },
        matches: function(pattern) {
          return pattern.test(this.message.text);
        }
      });
    });
  });
};

ChatClient.prototype.sendMessage = function(message, room) {
  this.socket.emit('messages:create', { text: message, room: room });
};

ChatClient.prototype.connect = function() {
  var that = this;
  that.socket = io.connect(that.url);

  return Rx.Observable.create(function(observer) {
    that.socket.on('connect', function() {
      that.socket.emit('account:whoami', function(account) {
        that.account = account;
      });
      observer.onNext();
    });

    that.socket.on('error', function(err) {
      observer.onError(err);
    });

    that.socket.on('disconnect', function() {
      observer.onCompleted();
    });

    return function() {
      that.socket.disconnect();
    }
  });
};

module.exports = ChatClient;
