'use strict'
var env = require('node-env-file');
env(__dirname + '/../.env');

const assert = require('chai').assert;
const Botmock = require('botkit-mock');
const OtxSkill = require('../skills/otx.js')
var sinon = require('sinon');
var otxSdk = require('../components/otx-node-sdk/index.js');

// TODO: I'm doing something incorrect with Mocha regarding Promises vs. done() function in the test cases. When
// tests fail, the assertion failure details print in an odd spot in the terminal output, and the test reports a
// timeout failure. This implies to me an asynchronous timing issue that I haven't quite sorted out.

describe('When talking to TIPBot', function() {

    // Prepare our OTX SDK client to be stubbed
    before(function(){
        this.otxSdkStub = new otxSdk("foo");

        // Stub the OTX SDK client search.pulses method to return a canned JSON response
        this.pulsesStub = sinon.stub(this.otxSdkStub.search, "pulses");
        this.pulsesStub.callsArgWith(3, null, pulseSearchResponse);

        // Stub the OTX SDK client indicators ipv4 method to return a canned JSON response
        this.ipv4Stub = sinon.stub(this.otxSdkStub.indicators, "ipv4");
        this.ipv4Stub.callsArgWith(2, null, indicatorIPv4SearchResponse);

        // Stub the OTX SDK client indicators ipv4 method to return a canned JSON response
        this.fileStub = sinon.stub(this.otxSdkStub.indicators, "file");
        this.fileStub.callsArgWith(2, null, indicatorFileSearchResponse);
    });

    // Wire up mocked Slack back-end, so that our Slackbot OTXSkill can respond to input
    beforeEach(function(){
        this.controller = Botmock({
            stats_optout: true
            // debug: true,
        });

        this.bot = this.controller.spawn({type: 'slack'});
        OtxSkill(this.controller, this.otxSdkStub);
    });

    afterEach(function () {
        this.controller.shutdown();
    });

    it('should search pulses when command is pulses', function(done){
        var scope = this;

        // Chat a search command to the SlackBot, and validate it issues the request to the OTX client, and processes
        // the reponse as expected
        this.bot.usersInput(
            sendSlackMessage('pulses Zahrani')
        ).then(function(message){
            assert.isTrue(scope.pulsesStub.calledWith("Zahrani"), "Pulse search term parsed incorrectly.");

            assert.include(message.text, "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "Bot didn't return pulse name");
            assert.include(message.text, "https://twitter.com/eyalsela/status/920661179009241093", "Bot didn't return pulse reference");
            assert.include(message.text, "ISMDoor, malware, ZAHRANI, eyalsela, ThetaRay", "Bot didn't return pulse tags");
            done();
        })
    });

    it('should handle pulse searches with multiple terms', function(done){
        var scope = this;

        this.bot.usersInput(
            sendSlackMessage('pulses Zahrani tofsee')
        ).then(function(message){
            assert.isTrue(scope.pulsesStub.calledWith("Zahrani%20tofsee"), "Pulse search term parsed incorrectly.");
            done();
        })
    });

    it('should search indicators when command is an OTX indicator type', function(done){
        var scope = this;

        this.bot.usersInput(
            sendSlackMessage('indicator ipv4 103.205.14.176')
        ).then(function(message){
            assert.isTrue(scope.ipv4Stub.calledWith("103.205.14.176", "general"), "Indicators search term parsed incorrectly.");

            assert.include(message.text, "Telnet honeypot logs for 2017-10-19", "Bot didn't return pulse name");
            assert.include(message.text, "https://otx.alienvault.com/pulse/59e97484de07792a36a2886e", "Bot didn't return pulse reference");
            assert.include(message.text, "Telnet, bruteforce, honeypot", "Bot didn't return pulse tags");
            done();
        })
    });

    it('should call the specified indicator function in the OTX client', function(done){
        var scope = this;

        this.bot.usersInput(
            sendSlackMessage('indicator file f5ef3b060fb476253f9a7638f82940d9')
        ).then(function(message){
            assert.isTrue(scope.fileStub.calledWith("f5ef3b060fb476253f9a7638f82940d9", "general"), "Indicators search term parsed incorrectly.");

            assert.include(message.text, "Iranian Threat Agent Greenbug Impersonates Israeli High-Tech and Cyber Security Companies", "Bot didn't return pulse name");
            assert.include(message.text, "https://otx.alienvault.com/pulse/59ef6121432b5d3e034fcd88", "Bot didn't return pulse reference");
            assert.include(message.text, "greenbug, iran, israel", "Bot didn't return pulse tags");
            done();
        })
    });

    it('should respond with help docs', function(done){
         this.bot.usersInput(
            sendSlackMessage('help')           
        ).then(function(message){
            assert.include(message.text, "TIPBot Help:", "Bot didn't return help docs");
            done();
        })
    });

    //-------------------------------------------------------------------------------------------//
    // Utility functions
    //-------------------------------------------------------------------------------------------//
    var sendSlackMessage = function(text){
        return [
                {
                    user: 'someUserId',
                    channel: 'someChannel',
                    messages: [
                        {
                            text: text,
                            isAssertion: true
                        }
                    ]
                }
            ];
    }

    //-------------------------------------------------------------------------------------------//
    // Mocked OTX responses. I would prefer to house this content in formatted external JSON files,
    // but not critical given small number of tests, and it's really, really late at the moment :-).
    //-------------------------------------------------------------------------------------------//
    var pulseSearchResponse = '{"count": 1, "exact_match": "", "httpStatusCode": 200, "next": null, "previous": null, "results": [{"TLP": "white", "adversary": "", "author_name": "AlienVault", "created": "2017-10-18T14:59:17.168000", "description": "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "id": "59e76c453bd1b0125321fb06", "indicators": [{"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395578, "indicator": "allsecpackupdater.com", "title": "", "type": "domain"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395579, "indicator": "dnsupdater.com", "title": "", "type": "domain"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395580, "indicator": "lbolbo.com", "title": "", "type": "domain"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395581, "indicator": "winscripts.net", "title": "", "type": "domain"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395582, "indicator": "ymaaz.com", "title": "", "type": "domain"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395583, "indicator": "ns1.securepackupdater.com", "title": "", "type": "hostname"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395584, "indicator": "ns1.thetaraysecurityupdate.com", "title": "", "type": "hostname"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395585, "indicator": "ns1.winsecupdater.com", "title": "", "type": "hostname"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395586, "indicator": "ns2.securepackupdater.com", "title": "", "type": "hostname"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395587, "indicator": "ns2.thetaraysecurityupdate.com", "title": "", "type": "hostname"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395588, "indicator": "ns2.winsecupdater.com", "title": "", "type": "hostname"}, {"content": "", "created": "2017-10-18T14:59:19", "description": "", "id": 117395589, "indicator": "f5ef3b060fb476253f9a7638f82940d9", "title": "", "type": "FileHash-MD5"} ], "industries": [], "modified": "2017-10-18T14:59:17.168000", "name": "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "public": 1, "references": ["https://twitter.com/eyalsela/status/920661179009241093"], "revision": 1, "tags": ["ISMDoor", "malware", "ZAHRANI", "eyalsela", "ThetaRay"], "targeted_countries": ["Saudi Arabia"] } ] }';

    var indicatorIPv4SearchResponse = '{"sections": ["general", "geo", "reputation", "url_list", "passive_dns", "malware", "nids_list", "http_scans"], "city": null, "area_code": 0, "pulse_info": {"count": 4, "references": [], "pulses": [{"indicator_type_counts": {"URL": 29, "FileHash-SHA1": 24, "IPv4": 303, "FileHash-MD5": 24, "FileHash-SHA256": 24}, "pulse_source": "api", "TLP": "green", "description": "Telnet honeypot logs for brute force attackers from a US /32", "subscriber_count": 409, "tags": ["Telnet", "bruteforce", "honeypot"], "export_count": 1, "is_following": 0, "is_modified": false, "upvotes_count": 0, "modified_text": "5 days ago ", "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "is_author": false, "adversary": "", "id": "59e97484de07792a36a2886e", "observation": {"indicator_type_counts": {"URL": 29, "FileHash-SHA1": 24, "IPv4": 303, "FileHash-MD5": 24, "FileHash-SHA256": 24}, "pulse_source": "api", "description": "Telnet honeypot logs for brute force attackers from a US /32", "subscriber_count": 2, "cloned_from": null, "is_subscribed": 0, "comment_count": 0, "author_name": "jnazario", "upvotes_count": 0, "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "adversary": "", "id": "59e97484de07792a36a2886e", "extract_source": [], "industries": [], "tlp": "green", "locked": 0, "name": "Telnet honeypot logs for 2017-10-19", "is_following": 0, "created": "2017-10-20T03:59:00.674000", "tags": ["Telnet", "bruteforce", "honeypot"], "downvotes_count": 0, "modified": "2017-10-20T03:59:00.674000", "export_count": 1, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/jnazario/resized/80/Screen Shot 2016-07-24 at 12.24.30 PM.png", "follower_count": 0, "votes_count": 0, "author_id": 14926, "user_subscriber_count": 407, "public": 1, "revision": 1}, "industries": [], "locked": 0, "name": "Telnet honeypot logs for 2017-10-19", "created": "2017-10-20T03:59:00.674000", "cloned_from": null, "downvotes_count": 0, "modified": "2017-10-20T03:59:00.674000", "comment_count": 0, "indicator_count": 404, "author": {"username": "jnazario", "is_subscribed": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/jnazario/resized/80/Screen Shot 2016-07-24 at 12.24.30 PM.png", "is_following": 0, "id": "14926"}, "in_group": false, "follower_count": 0, "votes_count": 0, "public": 1}, {"indicator_type_counts": {"IPv4": 345}, "pulse_source": "api", "TLP": "green", "description": "SSH and telnet access logs from 2017-10-19. Automatically generated pulse based on logins to multiple Cowrie honeypots in Norway. Submitted with the OTX Python SDK.", "subscriber_count": 399, "tags": ["ssh", "bruteforce", "honeypot", "telnet"], "export_count": 0, "is_following": 0, "is_modified": false, "upvotes_count": 0, "modified_text": "5 days ago ", "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "is_author": false, "adversary": "", "id": "59e924c5de077904dba2886e", "observation": {"indicator_type_counts": {"IPv4": 345}, "pulse_source": "api", "description": "SSH and telnet access logs from 2017-10-19. Automatically generated pulse based on logins to multiple Cowrie honeypots in Norway. Submitted with the OTX Python SDK.", "subscriber_count": 1, "cloned_from": null, "is_subscribed": 0, "comment_count": 0, "author_name": "burberry", "upvotes_count": 0, "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "adversary": "", "id": "59e924c5de077904dba2886e", "extract_source": [], "industries": [], "tlp": "green", "locked": 0, "name": "SSH/telnet honeypot logs 2017-10-19", "is_following": 0, "created": "2017-10-19T22:18:45.249000", "tags": ["ssh", "bruteforce", "honeypot", "telnet"], "downvotes_count": 0, "modified": "2017-10-19T22:18:45.249000", "export_count": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/burberry/resized/80/burberry2.png", "follower_count": 0, "votes_count": 0, "author_id": 11197, "user_subscriber_count": 398, "public": 1, "revision": 1}, "industries": [], "locked": 0, "name": "SSH/telnet honeypot logs 2017-10-19", "created": "2017-10-19T22:18:45.249000", "cloned_from": null, "downvotes_count": 0, "modified": "2017-10-19T22:18:45.249000", "comment_count": 0, "indicator_count": 345, "author": {"username": "burberry", "is_subscribed": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/burberry/resized/80/burberry2.png", "is_following": 0, "id": "11197"}, "in_group": false, "follower_count": 0, "votes_count": 0, "public": 1}, {"indicator_type_counts": {"IPv4": 389}, "pulse_source": "api", "TLP": "green", "description": "SSH and telnet access logs from 2017-10-18. Automatically generated pulse based on logins to multiple Cowrie honeypots in Norway. Submitted with the OTX Python SDK.", "subscriber_count": 399, "tags": ["ssh", "bruteforce", "honeypot", "telnet"], "export_count": 0, "is_following": 0, "is_modified": false, "upvotes_count": 0, "modified_text": "6 days ago ", "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "is_author": false, "adversary": "", "id": "59e7d34397fc980f55cfad13", "observation": {"indicator_type_counts": {"IPv4": 389}, "pulse_source": "api", "description": "SSH and telnet access logs from 2017-10-18. Automatically generated pulse based on logins to multiple Cowrie honeypots in Norway. Submitted with the OTX Python SDK.", "subscriber_count": 1, "cloned_from": null, "is_subscribed": 0, "comment_count": 0, "author_name": "burberry", "upvotes_count": 0, "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "adversary": "", "id": "59e7d34397fc980f55cfad13", "extract_source": [], "industries": [], "tlp": "green", "locked": 0, "name": "SSH/telnet honeypot logs 2017-10-18", "is_following": 0, "created": "2017-10-18T22:18:43.565000", "tags": ["ssh", "bruteforce", "honeypot", "telnet"], "downvotes_count": 0, "modified": "2017-10-18T22:18:43.565000", "export_count": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/burberry/resized/80/burberry2.png", "follower_count": 0, "votes_count": 0, "author_id": 11197, "user_subscriber_count": 398, "public": 1, "revision": 1}, "industries": [], "locked": 0, "name": "SSH/telnet honeypot logs 2017-10-18", "created": "2017-10-18T22:18:43.565000", "cloned_from": null, "downvotes_count": 0, "modified": "2017-10-18T22:18:43.565000", "comment_count": 0, "indicator_count": 389, "author": {"username": "burberry", "is_subscribed": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/burberry/resized/80/burberry2.png", "is_following": 0, "id": "11197"}, "in_group": false, "follower_count": 0, "votes_count": 0, "public": 1}, {"indicator_type_counts": {"IPv4": 386}, "pulse_source": "api", "TLP": "green", "description": "SSH and telnet access logs from 2017-10-17. Automatically generated pulse based on logins to multiple Cowrie honeypots in Norway. Submitted with the OTX Python SDK.", "subscriber_count": 400, "tags": ["ssh", "bruteforce", "honeypot", "telnet"], "export_count": 0, "is_following": 0, "is_modified": false, "upvotes_count": 0, "modified_text": "7 days ago ", "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "is_author": false, "adversary": "", "id": "59e681c2a70c8326c06bb767", "observation": {"indicator_type_counts": {"IPv4": 386}, "pulse_source": "api", "description": "SSH and telnet access logs from 2017-10-17. Automatically generated pulse based on logins to multiple Cowrie honeypots in Norway. Submitted with the OTX Python SDK.", "subscriber_count": 2, "cloned_from": null, "is_subscribed": 0, "comment_count": 0, "author_name": "burberry", "upvotes_count": 0, "is_subscribing": 0, "references": [], "targeted_countries": [], "groups": [], "vote": 0, "validator_count": 0, "adversary": "", "id": "59e681c2a70c8326c06bb767", "extract_source": [], "industries": [], "tlp": "green", "locked": 0, "name": "SSH/telnet honeypot logs 2017-10-17", "is_following": 0, "created": "2017-10-17T22:18:42.939000", "tags": ["ssh", "bruteforce", "honeypot", "telnet"], "downvotes_count": 0, "modified": "2017-10-17T22:18:42.939000", "export_count": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/burberry/resized/80/burberry2.png", "follower_count": 0, "votes_count": 0, "author_id": 11197, "user_subscriber_count": 398, "public": 1, "revision": 1}, "industries": [], "locked": 0, "name": "SSH/telnet honeypot logs 2017-10-17", "created": "2017-10-17T22:18:42.939000", "cloned_from": null, "downvotes_count": 0, "modified": "2017-10-17T22:18:42.939000", "comment_count": 0, "indicator_count": 386, "author": {"username": "burberry", "is_subscribed": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/burberry/resized/80/burberry2.png", "is_following": 0, "id": "11197"}, "in_group": false, "follower_count": 0, "votes_count": 0, "public": 1}]}, "continent_code": "AS", "country_name": "India", "postal_code": null, "dma_code": 0, "country_code": "IN", "flag_url": "/static/img/flags/in.png", "asn": "AS134859 IMPERIAL TECH SERVICES", "city_data": true, "indicator": "103.205.14.176", "whois": "http://whois.domaintools.com/103.205.14.176", "type_title": "IPv4", "region": null, "charset": 0, "longitude": 77.0, "country_code3": "IND", "reputation": 1, "base_indicator": {"indicator": "103.205.14.176", "description": "", "title": "", "access_reason": "", "access_type": "public", "content": "", "type": "IPv4", "id": 116483789}, "latitude": 20.0, "validation": [], "type": "IPv4", "flag_title": "India"}';

    var indicatorFileSearchResponse = '{"indicator": "f5ef3b060fb476253f9a7638f82940d9", "sections": ["general", "analysis"], "pulse_info": {"count": 2, "references": ["http://www.clearskysec.com/greenbug/", "https://twitter.com/eyalsela/status/920661179009241093"], "pulses": [{"indicator_type_counts": {"FileHash-SHA256": 1, "domain": 21, "FileHash-MD5": 8}, "pulse_source": "web", "TLP": "white", "description": "Iranian Threat Agent Greenbug  has been registering domains similar to those of Israeli High-Tech and Cyber Security Companies.", "subscriber_count": 41356, "tags": ["greenbug", "iran", "israel"], "export_count": 13, "is_following": 0, "is_modified": true, "upvotes_count": 0, "modified_text": "7 hours ago ", "is_subscribing": 0, "references": ["http://www.clearskysec.com/greenbug/"], "targeted_countries": ["Israel"], "groups": [], "vote": 0, "validator_count": 0, "is_author": false, "adversary": "Greenbug", "id": "59ef6121432b5d3e034fcd88", "observation": {"indicator_type_counts": {"FileHash-SHA256": 1, "domain": 21, "FileHash-MD5": 8}, "pulse_source": "web", "description": "Iranian Threat Agent Greenbug  has been registering domains similar to those of Israeli High-Tech and Cyber Security Companies.", "subscriber_count": 8, "cloned_from": null, "is_subscribed": 0, "comment_count": 0, "author_name": "AlienVault", "upvotes_count": 0, "is_subscribing": 0, "references": ["http://www.clearskysec.com/greenbug/"], "targeted_countries": ["Israel"], "groups": [], "vote": 0, "validator_count": 0, "adversary": "Greenbug", "id": "59ef6121432b5d3e034fcd88", "extract_source": [], "industries": ["Technology"], "tlp": "white", "locked": 0, "name": "Iranian Threat Agent Greenbug Impersonates Israeli High-Tech and Cyber Security Companies", "is_following": 0, "created": "2017-10-24T15:49:53.809000", "tags": ["greenbug", "iran", "israel"], "downvotes_count": 0, "modified": "2017-10-24T23:13:21.373000", "export_count": 13, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/AlienVault/resized/80/unnamed (1).jpg", "follower_count": 0, "votes_count": 0, "author_id": 2, "user_subscriber_count": 41348, "public": 1, "revision": 1}, "industries": ["Technology"], "locked": 0, "name": "Iranian Threat Agent Greenbug Impersonates Israeli High-Tech and Cyber Security Companies", "created": "2017-10-24T15:49:53.809000", "cloned_from": null, "downvotes_count": 0, "modified": "2017-10-24T23:13:21.373000", "comment_count": 0, "indicator_count": 30, "author": {"username": "AlienVault", "is_subscribed": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/AlienVault/resized/80/unnamed (1).jpg", "is_following": 0, "id": "2"}, "in_group": false, "follower_count": 0, "votes_count": 0, "public": 1}, {"indicator_type_counts": {"domain": 5, "hostname": 6, "FileHash-MD5": 1}, "pulse_source": "web", "TLP": "white", "description": "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "subscriber_count": 41365, "tags": ["ISMDoor", "malware", "ZAHRANI", "eyalsela", "ThetaRay"], "export_count": 9, "is_following": 0, "is_modified": false, "upvotes_count": 0, "modified_text": "6 days ago ", "is_subscribing": 0, "references": ["https://twitter.com/eyalsela/status/920661179009241093"], "targeted_countries": ["Saudi Arabia"], "groups": [], "vote": 0, "validator_count": 0, "is_author": false, "adversary": "", "id": "59e76c453bd1b0125321fb06", "observation": {"indicator_type_counts": {"domain": 5, "hostname": 6, "FileHash-MD5": 1}, "pulse_source": "web", "description": "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "subscriber_count": 17, "cloned_from": null, "is_subscribed": 0, "comment_count": 0, "author_name": "AlienVault", "upvotes_count": 0, "is_subscribing": 0, "references": ["https://twitter.com/eyalsela/status/920661179009241093"], "targeted_countries": ["Saudi Arabia"], "groups": [], "vote": 0, "validator_count": 0, "adversary": "", "id": "59e76c453bd1b0125321fb06", "extract_source": [], "industries": [], "tlp": "white", "locked": 0, "name": "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "is_following": 0, "created": "2017-10-18T14:59:17.168000", "tags": ["ISMDoor", "malware", "ZAHRANI", "eyalsela", "ThetaRay"], "downvotes_count": 0, "modified": "2017-10-18T14:59:17.168000", "export_count": 9, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/AlienVault/resized/80/unnamed (1).jpg", "follower_count": 0, "votes_count": 0, "author_id": 2, "user_subscriber_count": 41348, "public": 1, "revision": 1}, "industries": [], "locked": 0, "name": "#ISMDoor impersonates ZAHRANI (an electrical equipment and engineering company in Saudi Arabia) and ThetaRay.", "created": "2017-10-18T14:59:17.168000", "cloned_from": null, "downvotes_count": 0, "modified": "2017-10-18T14:59:17.168000", "comment_count": 0, "indicator_count": 12, "author": {"username": "AlienVault", "is_subscribed": 0, "avatar_url": "https://otx20-web-media.s3.amazonaws.com/media/avatars/AlienVault/resized/80/unnamed (1).jpg", "is_following": 0, "id": "2"}, "in_group": false, "follower_count": 0, "votes_count": 0, "public": 1}]}, "base_indicator": {"indicator": "f5ef3b060fb476253f9a7638f82940d9", "description": "", "title": "", "access_reason": "", "access_type": "public", "content": "", "type": "FileHash-MD5", "id": 117395589}, "validation": [], "type": "md5", "type_title": "FileHash-MD5"}';
});