var _ = require('lodash'),
    path = require('path');

function PluginManager(chatClient, config) {
  this.chatClient = chatClient;
  this.config = config;
  this.listener = [];
  this.tasks = [];

}

PluginManager.prototype.initializeListener = function() {
  var that = this;

  _.forEach(this.config.activePlugins.listener, function(listener) {
    var listenerInstance = require('./listener/' + listener + '.js')(that.chatClient, that.config);
    that.listener.push(listenerInstance);
  });
};


PluginManager.prototype.initialize = function() {
    this.initializeListener();
};

module.exports = PluginManager;
