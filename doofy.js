var _ = require('lodash'),
    colors = require('colors'),
    url = require('url'),
    Client = require('./chat-client'),
    PluginManager = require('./plugins/'),
    userConfig = require('./config.json');

var defaultConfig = {
  chat: {
    protocol: '',
    hostname: '',
    post: '',
    token: ""
  },
  activePlugins: {
    listener: [],
    jobs: []
  },
  pluginConfigurations: { }
};

var config = _.assign(defaultConfig, userConfig),
    chatUrl = url.format({
      protocol: config.chat.protocol,
      hostname: config.chat.hostname,
      port: config.chat.port,
      query: {
        token: config.chat.token
      }
    }),
    client = new Client(chatUrl),
    pluginManager = new PluginManager(client, config);

var clientSubscription = client.connect(chatUrl).subscribe(function() {
    console.log('connected'.green);

    pluginManager.initialize();

    client.rooms()
      .subscribe(function(rooms) {
        client.subscribeToRooms(rooms);
      });
  },
  function(err) {
    console.log('err', err);
  }, function() {
    console.log('completed');
  });
