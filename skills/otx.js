// Enable AlienVault OTX SDK library (sadly not published via NPM yet)
var otxSdk = require('../components/otx-node-sdk/index.js');

module.exports = function(controller) {
    otx = new otxSdk(controller.config.otx_token);
    var otx_cmd = "otx";

    controller.hears([otx_cmd], 'direct_message,direct_mention', function(bot, message){
        var args = message.text.replace(otx_cmd, "").trim().split(" ");
        otx.indicators[args[0]](args[2], args[1], function(error, response){
            bot.reply(message, JSON.stringify(response, null, 2));
        });
    });
}