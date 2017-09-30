'use strict'

const assert = require('assert');
const Botmock = require('botkit-mock');
const OtxSkill = require('../skills/otx.js')

describe('When talking to TIPBot', function() {
    beforeEach(function(){
        this.controller = Botmock({
            stats_optout: true,
            debug: true,
        });
        // type can be ‘slack’, facebook’, or null
        this.bot = this.controller.spawn({type: 'slack'});
        OtxSkill(this.controller);
    });

    afterEach(function () {
        this.controller.shutdown();
    });

    it('should search pulses when told to search-pulses', function(done){
        this.bot.usersInput(
            [
                {
                    user: 'someUserId',
                    channel: 'someChannel',
                    messages: [
                        {
                            text: 'search-pulses Ramnit', isAssertion: true
                        }
                    ]
                }
            ]
        ).then(function(message){
            assert.equal("From OTX: ", message.text, "Bot didn't respond as expected");
            done();
        })
    });
});