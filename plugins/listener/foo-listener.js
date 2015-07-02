module.exports = function(chatClient, config) {
  chatClient
    .newMessages()
    .subscribe(function(message) {
      console.log('foo', message);
    });
};
