var _ = require('lodash'),
    io = require('socket.io-client'),
    colors = require('colors'),
    url = require('url'),
    e = require('dotenv').load();

var protocol = process.env.DOOFY_PROTOCOL
    hostname = process.env.DOOFY_HOSTNAME,
    port = process.env.DOOFY_PORT,
    token = process.env.DOOFY_TOKEN;

var chatUrl = url.format({
  protocol: protocol,
  hostname: hostname,
  port: port,
  query: {
    token: token
  }
});

var socket = io.connect(chatUrl),
    currentProfile;

socket.on('connect', function() {
  console.log('Connected!'.green);

  socket.emit('rooms:list', function(rooms) {
    _.forEach(rooms, function(room) {
      socket.emit('rooms:join', room.id, function(room) {
        console.log('Room joined:'.gray, room.name.gray);
      });
    });
  });

  socket.emit('account:whoami', function(profile) {
    currentProfile = profile;
    console.log('Connected as:'.green, profile.username);
  });

});

socket.on('error', function(err) {
  console.log('Connection error:'.red, err);
});

socket.on('disconnect', function() {
  console.log('Disconnected!'.yellow);
});

socket.on('messages:new', function(message) {
  console.log(message);
});
