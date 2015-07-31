var _ = require('lodash'),
    url = require('url'),
    request = require('request');

function _buildUrl(apiKey, cityId) {
  return url.format({
    protocol: 'http',
    port: 80,
    hostname: 'api.openweathermap.org',
    pathname: '/data/2.5/weather',
    query: {
      units: 'metric',
      lang: 'de',
      'APPID': apiKey,
      id: cityId
    }
  });
}

function _getWeather(config, callback) {
  var requestUrl = _buildUrl(config.apiKey, config.cityId);
  request(requestUrl, function (err, response, body) {
    if(err) {
      return callback(err);
    }

    if (response.statusCode == 200) {
      callback(null, JSON.parse(body));
    }
  });
}

/*
  Example config:
  "weather": {
      "apiKey": "<get it here: http://home.openweathermap.org/>",
      "cityId": "<your city id>"
  }
*/

module.exports = function(chatClient, config) {
  chatClient
    .newMessages()
    .filter(function(e) { return e.mentioned; })
    .filter(function(e) { return e.matches(/(wetter|weather)/ig); })
    .subscribe(function(e) {
      _getWeather(config, function(err, res) {
        if(err) {
          console.log('Weather screwed up -.-'.red);
          return;
        }

        var response = [
          'Wetter in ' + res.name + ': ' + res.weather[0].description,
          'Aktuelle Temperatur: ' + res.main.temp + '°C',
          'Max: ' + res.main.temp_max + '°C',
          'Min: ' + res.main.temp_min + '°C'
        ].join('\r\n');

        e.respond(response);
      });
    });
};
