// Enable AlienVault OTX SDK library (sadly not published via NPM yet)
var otxSdk = require('../components/otx-node-sdk/index.js');

module.exports = function(controller) {
    otx = new otxSdk(controller.config.otx_token);
    var otx_cmd = "otx";

    controller.hears([otx_cmd], 'direct_message,direct_mention', function(bot, message){
        var args = message.text.replace(otx_cmd, "").trim().split(" ");

        if(args[0] == "pulses"){
            otx.search.pulses(args[1], "1", null, function(error, response){
                console.log("indicator:" + JSON.stringify(response, null, 2));

                bot.reply(message, JSON.stringify(response, null, 2));
            });
        }
        else{
            otx.indicators[args[0]](args[2], args[1], function(error, response){
                console.log("pulses" + JSON.stringify(response, null, 2));

                bot.reply(message, JSON.stringify(response, null, 2));
            });
        }
    });
}