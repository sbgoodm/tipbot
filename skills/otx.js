// Enable AlienVault OTX SDK library (sadly not published via NPM yet)
var otxSdk = require('../components/otx-node-sdk/index.js');

module.exports = function(controller) {
    var otx = new otxSdk(controller.config.otx_token);
    
    controller.hears(['otx'], 'direct_message,direct_mention', function(bot, message){
        otx.indicators.ipv4( '8.8.8.8', 'reputation', function(error, response){
            bot.reply(message, 'From OTX: '+ response);
        });
    });
}