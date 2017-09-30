// Enable AlienVault OTX SDK library (sadly not published via NPM yet)
var otxSdk = require('../components/otx-node-sdk/index.js');

module.exports = function(controller) {
    otx = new otxSdk(controller.config.otx_token);
    var search_pulses_cmd = "search-pulses";

    controller.hears([search_pulses_cmd], 'direct_message,direct_mention', function(bot, message){
        var q = message.text.replace(search_pulses_cmd, "");
        otx.search.pulses(q, "1", "1", function(error, response){
            bot.reply(message, response.results[0].description + "\n" + response.results[0].references.join(","));
        });
    });
}