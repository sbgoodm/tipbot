// Enable AlienVault OTX SDK library (sadly not published via NPM yet)
var otxSdk = require('../components/otx-node-sdk/index.js');
var _ = require('lodash');

module.exports = function(controller, otxClient) {
    otxClient = typeof otxClient !== 'undefined' ? otxClient : new otxSdk(process.env.otx_token);

    var indicator_cmd = "indicator";
    var pulses_cmd = "pulses";
    var help_cmd = "help";

    controller.hears([indicator_cmd], 'direct_message,direct_mention', function(bot, message){
        var args = message.text.replace(indicator_cmd, "").trim().split(" ");

        // Potentially a security vulnerability, dynamically calling a function from user input with no guard validations
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

    controller.hears([help_cmd], 'direct_message, direct_mention', function(bot, message){
        var help = "TIPBot Help: \n" +
        "today | returns five most recent pulses from the last 24 hours \n" + 
        "pulses <search_term> | returns any matching pulses from AlienVault OTX \n" +
        "indicator cve <cve_number> | returns any pulses that reference the specified CVE \n" +
        "indicator domain <domain_name> | returns any pulses that reference the specified domain \n" +
        "indicator file <file_hash> | returns any pulses that reference the specified file \n" +
        "indicator hostname <hostname> | returns any pulses that reference the specified hostname \n" +
        "indicator ipv4 <ipv4_address> | returns any pulses that reference the specified IPV4 address \n" +
        "indicator ipv6 <ipv6_address> | returns any pulses that reference the specified IPV6 address \n" +
        "indicator url <url> | returns any pulses that reference the specified URL \n";

        bot.reply(message, help);
    });
}