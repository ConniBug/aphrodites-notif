# Aphrodite's Stock Notifier

![ScreenShot](https://raw.githubusercontent.com/ConniBug/aphrodites-notif/main/assets/ss.jpg)

## Dont want to set it up..?

Join my discord and look in #aphrodites-store
https://discord.gg/Hd3VX6Njv5

# # Setup

Fill in the config.json with your discord webhook url then run `npm install`
then `npm start`

To run this on a server you will want to use something like pm2 to restart it if
it crashes
https://pm2.io/docs/plus/quick-start/

# How to use custom notification services

If you wish to add any custom notifiers services just add a <name>.js to
./notifs with this simple template

```js
module.exports.run = async (allDat, title, body, url) => {};
```
