/*
  standup-alarm - Fires up a messages at 9am daily
  ------------------------------------------------
  Example config:
  {
    "roomId": "<roomID>",
    "message": "Standup!"
  }
*/

module.exports = {
  triggerOnInitialization: false,
  trigger: '0 9 * * 1-5', // m h dom mon dow
  action: function(chatClient, config) {
    chatClient.sendMessage(config.message, config.roomId);
  }
}
