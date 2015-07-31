var _ = require('lodash'),
    exec = require('child_process').execFile,
    child;

var _fetchUnmergedRepositories = function(config, callback) {
  child = exec(config.git.exe
    ,['branch', '-r', '--no-merged', config.git.branch]
    ,{cwd: config.git.repo}
    ,function(err, out, errOut) {
      if(err) {
        return callback(err);
      }

      var repos = _(out.split('\n'))
        .chain()
        .map(function(r) { return r.trim() })
        .filter(function(r){ return r.length > 0 })
        .value();

      return callback(null, repos);
    });
};

/*
git-branch-reminder - Checks for unmerged git branches
------------------------------------------------------
Expected config:
"git-branch-reminder": {
  "roomId": "55...a",
  "message":"Clean up your mess!",
  "git": {
    "exe": "<path to your git executable>",
    "repo": "<path to your git repo>",
    "branch": "origin/master"
  }
}
*/

module.exports = {
    triggerOnInitialization: true,
    trigger: '0 10 * * *',
    action: function(chatClient, config) {
      _fetchUnmergedRepositories(config, function(err, repos) {
        if(repos.length == 0) {
          return;
        }

        chatClient.sendMessage(config.message, config.roomId);
        chatClient.sendMessage(repos.join('\r\n'), config.roomId);
      });
    }
};
