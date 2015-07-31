var _ = require('lodash'),
    url = require('url'),
    request = require('request');

function _buildUrl(config) {
  return url.format({
    protocol: config.stash.protocol,
    port: config.stash.port,
    hostname: config.stash.hostname,
    auth: config.stash.user + ':' + config.stash.password,
    pathname: '/rest/api/1.0/projects/' + config.stash.projectKey + '/repos/' + config.stash.repositorySlug + '/pull-requests'
  });
}

/*
  stash-open-prs: Reminds on open pr's
  ------------------------------------
  Example config:
  "stash-open-prs": {
    "roomId": "",
    "stash": {
      "port": 123,
      "hostname": "",
      "protocol": "https",
      "user": "",
      "password": "",
      "projectKey": "",
      "repositorySlug": ""
    }
  }
*/

module.exports = {
  triggerOnInitialization: true,
  trigger: '0 10 * * *',
  action: function(chatClient, config) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    request(_buildUrl(config), function(err, res, body) {
      if(err) {
        return console.log(err);
      }
      var response = JSON.parse(body);

      _.forEach(response.values, function(pr) {
        _.forEach(pr.reviewers, function(reviewer) {
          chatClient.sendMessage(
            'Hallo @' + reviewer.user.slug +', bitte reviewe folgenden PullRequest von ' + pr.author.user.displayName + ' : ' + pr.title + ' ' + pr.links.self[0].href + ' :+1:',
            config.roomId
          );
        });
      });
    });
  }
};
