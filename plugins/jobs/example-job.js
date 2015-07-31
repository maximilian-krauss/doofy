/*
example-job - Posts a message every 5 minutes
--------------------------------------------
Expected config:
{
  "roomId": ""<lets-chat-room-id>""
  "message": "hi guys!""
}
*/

module.exports = {
  triggerOnInitialization: false,
  trigger: '*/5 * * * *', // m h dom mon dow
  action: function(chatClient, config) {
    chatClient.sendMessage(config.message, config.roomId);
  }
};
