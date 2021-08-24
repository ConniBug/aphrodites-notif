const log = require('@connibug/js-logging');
const path = require('path');

// Generate an array of notification services
log.log("Loading notification services.");
var notifs = [];

var count = 0;
require('fs').readdirSync(path.join(__dirname, 'notifs')).forEach(function (file) {
	const name = path.basename(file, '.js')
    var tmpPath = path.join(__dirname, 'notifs', file);
    var tmpNotif = require(tmpPath);
    if(tmpNotif.run) {
        log.log(`Loaded new notification service: ${name}`);
        count++;
    } else {
        log.warning(`${file} - Doesnt have a valid exported run function`);
    }
    notifs.push(tmpNotif);
});
log.log(`Loaded ${count} notification services.`)

module.exports.sendNotif = async (newDat, title, body, url) => {
    notifs.forEach(notifService => {
        notifService.run(newDat, title, body, url)
    });
};

module.exports.sendMsg = async (title, body) => {
    notifs.forEach(notifService => {
        if(notifService.smallRun) {
            notifService.smallRun(title, body)
        }
    });
};