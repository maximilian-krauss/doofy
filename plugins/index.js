var _ = require('lodash'),
    path = require('path'),
    Rx = require('rx'),
    colors = require('colors'),
    CronJob = require('cron').CronJob;

function _createJob(name, pattern) {
  return Rx.Observable.create(function(obs) {
    var job = new CronJob({
      cronTime: pattern,
      start: true,
      onTick: function() {
        console.log('> Job triggered:'.gray, name.gray);
        obs.onNext();
      },
      onCompleted: function() {
        obs.onCompleted();
      }
    });

    return function() {
      console.log('job stopped!');
      job.stop();
    }
  });
}

function _pluginLoaded(name) {
  console.log('> Plugin ready: '.green, name.green);
}

function PluginManager(chatClient, config) {
  this.chatClient = chatClient;
  this.config = config;
}

PluginManager.prototype.findPluginConfiguration = function(pluginName) {
  return this.config.pluginConfigurations[pluginName];
};

PluginManager.prototype.initializeListener = function() {
  var that = this;

  _.forEach(this.config.activePlugins.listener, function(listener) {
    require('./listener/' + listener + '.js')(that.chatClient, that.findPluginConfiguration(listener));
    _pluginLoaded(listener);
  });
};

PluginManager.prototype.initializeJobs = function() {
  var that = this;

  _.forEach(this.config.activePlugins.jobs, function(jobName) {
    var jobInstance = require('./jobs/' + jobName + '.js'),
        obs = _createJob(jobName, jobInstance.trigger)
          .subscribe(function() {
            jobInstance.action(that.chatClient, that.findPluginConfiguration(jobName));
          });

    if(jobInstance.triggerOnInitialization) {
      obs.onNext();
    }

    _pluginLoaded(jobName);
  });
};

PluginManager.prototype.initialize = function() {
    this.initializeListener();
    this.initializeJobs();
};

module.exports = PluginManager;
