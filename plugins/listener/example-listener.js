module.exports = function(chatClient, config) {
  chatClient
    .newMessages()
    .filter(function(e) { return e.mentioned; })
    .filter(function(e) { return e.matches(/foo/ig); })
    .subscribe(function(message) {
      message.respond('https://pbs.twimg.com/profile_images/472822012537094144/RqMFaLtK.jpeg');
    });
};
