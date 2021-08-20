# Aphrodite's Stock Notifier

If you wish to add any custom notifiers services just add a <name>.js to ./notifs with this simple template


```js
module.exports.run = async (allDat, title, body, url) => {

};
```