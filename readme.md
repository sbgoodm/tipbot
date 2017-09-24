# Threat Intel Slackbot Prototype
This Slackbot listens to your questions about threat intelligence, and does its best to answer.

## Usage
1. [Visit this link](https://slack.com/oauth/authorize?&client_id=243871557045.246046908180&scope=bot) to sign into Slack and authorize the _Threat Intel Platform_ slackbot in your channels.
1. Either direct message @ATIPbot or invite it to one of your channels.
1. Say `@ATIPBot help` for a list of supported commands

## Rationale for distributing as a public Slack App
This Slackbot app is based off the very convenient Botkit scaffolding. The code was cloned from https://github.com/howdyai/botkit-starter-slack. Registering a Slack app with a given workspace requires a fair amount of configuration within the Slack API, specifically:
* Creating a bot user account
* Enabling OAuth registration with a callback URL
* Enabling event subscriptions with a callback URL
* Subscribing to particular events

Additionally, the callback URL requires that this Slackbot be hosted publicly. Given these configuration and hosting needs, it seemed easier to set them up once, and let you install the app to quickly take advantage of the bot functionality in your Slack channels.

## Running Slackbot locally
If you do want to run this Slackbot yourself, you'll need a public hosting solution. Glitch.com is a quick and easy option. Heroku works. AWS has a free tier too. Once you've picked your hosting environment:
1. Clone this repo.
1. `cd repo && npm install`
1. [Follow these excellent instructions from Botkit on configuring your Slack App.](https://github.com/howdyai/botkit/blob/master/docs/slack-events-api.md)
1. Update your `.env` file with your Slack App's client ID, client secret and port.
1. `node .`
1. Browse to `http://your-url:3000/login`