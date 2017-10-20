'use strict'
var env = require('node-env-file');
env(__dirname + '/../.env');

const assert = require('chai').assert;
const Botmock = require('botkit-mock');
const OtxSkill = require('../skills/otx.js')

describe('When talking to TIPBot', function() {
    this.timeout(5000);

    beforeEach(function(){
        this.controller = Botmock({
            stats_optout: true
            // debug: true,
        });
        // type can be ‘slack’, facebook’, or null
        this.bot = this.controller.spawn({type: 'slack'});
        this.controller.config = {'otx_token': process.env.otx_token};
        OtxSkill(this.controller);
    });

    afterEach(function () {
        this.controller.shutdown();
    });

    it('should search should search pulses when command is pulses', function(done){
        this.bot.usersInput(
            [
                {
                    user: 'someUserId',
                    channel: 'someChannel',
                    messages: [
                        {
                            text: 'otx pulses Zahrani',
                            isAssertion: true
                        }
                    ]
                }
            ]
        ).then(function(message){
            assert.isNotNull(message.text, "Bot didn't respond to otx pulses command");
            done();
        })
    });

    it('should search indicators when command is an OTX indicator type', function(done){
        this.bot.usersInput(
            [
                {
                    user: 'someUserId',
                    channel: 'someChannel',
                    messages: [
                        {
                            text: 'otx ipv4 general 103.205.14.176',
                            isAssertion: true
                        }
                    ]
                }
            ]
        ).then(function(message){
            assert.isNotNull(message.text, "Bot didn't respond to otx ipv4 command");
            done();
        })
    });
});