# Aphrodite's Stock Notifier

## Reqs

## Packages used

![ss](https://raw.githubusercontent.com/ConniBug/aphrodites-notif/main/assets/ss.jpg)

# # Setup
Fill in the config.json with your discord webhook url
then run 
`npm install`
then 
`npm start`

To run this on a server you will want to use something like pm2 to restart it if it crashes


# Custom notif servers

If you wish to add any custom notifiers services just add a <name>.js to ./notifs with this simple template

```js
module.exports.run = async (allDat, title, body, url) => {

};
```
