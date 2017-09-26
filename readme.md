# Threat Intel Slackbot Prototype
This Slackbot listens to your questions about threat intelligence, and does its best to answer.

## Usage
1. [Visit this link](https://atipbot.herokuapp.com/) to sign into Slack and authorize the _Threat Intel Platform_ slackbot in your channels.
1. Either direct message @ATIPbot or invite it to one of your channels.
1. Say `@ATIPBot help` for a list of supported commands

## Rationale for distributing as a public Slack App
This Slackbot app is based off the very convenient Botkit scaffolding. The code was cloned from https://github.com/howdyai/botkit-starter-slack. Registering a Slack app with a given workspace requires a fair amount of configuration within the Slack API, specifically:
* Creating a bot user account
* Enabling OAuth registration with a callback URL
* Enabling event subscriptions with a callback URL
* Subscribing to particular events

Additionally, the callback URL requires that this Slackbot be hosted publicly. Given these configuration and hosting needs, it seemed easier to set them up once, and let you install the app to quickly take advantage of the bot functionality in your Slack channels.

## Running Slackbot yourself
If you do want to run this Slackbot yourself, you'll need a public hosting solution. [Heroku is most convenient](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction), and you can be up and running easily. AWS has a free tier too. Glitch.com is a quick and easy option, but doesn't seem to support git submodules that well. Once you've picked your hosting environment:
1. Clone this repo.
1. `cd tipbot`
1. `git submodule init`
1.  `git submodule update`
1. `npm install`
1. [Follow these excellent instructions from Botkit on configuring your Slack App.](https://github.com/howdyai/botkit/blob/master/docs/slack-events-api.md)
1. Update your `.env` file with your Slack App's client ID, client secret, AlienVault OTX token, and port. 
    * If you use Heroku as your hosting provider, this can also be done with the [Heroku CLI via `heroku config:set`](https://devcenter.heroku.com/articles/getting-started-with-nodejs#define-config-vars).
1. `node .`
1. Browse to `http://your-url:your_port/login`