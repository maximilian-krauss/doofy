var _ = require('lodash'),
    colors = require('colors'),
    url = require('url'),
    e = require('dotenv').load()
    Client = require('./chat-client'),
    PluginManager = require('./plugins/');

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

var config = {
  activePlugins: {
    listener: ['foo-listener'],
    tasks: []
  },
  pluginConfigurations: {
    foo: {
      bar: true
    }
  }
};

var client = new Client(chatUrl);
var pluginManager = new PluginManager(client, config);

var clientSubscription = client.connect(chatUrl).subscribe(
  function() {
    console.log('connected');

    pluginManager.initialize();

    client.rooms()
      .subscribe(function(rooms) {
        client.subscribeToRooms(rooms);
      });

    client.newMessages()
      .subscribe(function(message) {
        console.log('new message arrived:'.green, message);

        message.respond('Ok, I get that!');
      });
  },
  function(err) {
    console.log('err', err);
  }, function() {
    console.log('completed');
  });
