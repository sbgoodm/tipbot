// Enable AlienVault OTX SDK library (sadly not published via NPM yet)
var otxSdk = require('../components/otx-node-sdk/index.js');
var _ = require('lodash');

module.exports = function(controller, otxClient=new otxSdk(controller.config.otx_token)) {
    var indicator_cmd = "indicator";
    var pulses_cmd = "pulses";

    controller.hears([indicator_cmd], 'direct_message,direct_mention', function(bot, message){
        var args = message.text.replace(indicator_cmd, "").trim().split(" ");

        otxClient.indicators[args[0]](args[1], "general", function(error, response){
            var pulses = _.map(JSON.parse(response).pulse_info.pulses, function(pulse){
                return pulse.name + "\nhttps://otx.alienvault.com/pulse/"+ pulse.id + "\n" + pulse.tags.join(", ");
            });

            bot.reply(message, pulses.join("\n\n"));
        })        
    });

    controller.hears([pulses_cmd], 'direct_message, direct_mention', function(bot, message){
        var q = message.text.replace(pulses_cmd, "").trim();
        otxClient.search.pulses(encodeURIComponent(q), "1", null, function(error, response){
            var pulses = _.map(JSON.parse(response).results, function(result){
                return result.name + "\n" + result.references.join("\n") + result.tags.join(", ");
            });

            bot.reply(message, pulses.join("\n\n"));
        });
    });
}