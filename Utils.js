const log = require('@connibug/js-logging');
var packageInfo = require("./package.json");
var serverVersion = packageInfo.version;
const os = require('os');

module.exports.HasChanged = (oldDat, newDat) => {
    if(oldDat.ref != newDat.ref) {
        return "ref";
    }
    if(oldDat.name != newDat.name) {
        return "name";
    }
    if(oldDat.category != newDat.category) {
        return "category";
    }
    if(oldDat.shu != newDat.shu) {
        return "shu";
    }
    if(oldDat.price != newDat.price) {
        return "price";
    }
    if(oldDat.promo != newDat.promo) {
        return "promo";
    }
    if(oldDat.stock != newDat.stock) {
        return "stock";
    }
    return false;
};
  
const { exec } = require("child_process");
let needStashREGEX = new RegExp('Please.commit.your.changes');
let alreadUpToDateREGEX = new RegExp('Already.up.to.date');
const notificationService = require("./notificationHandler");

module.exports.handleCD = (shouldRestart = false) => {
    console.log("CD");
    exec("git pull", (error, stdout, stderr) => {
        if (error) {
            if(error.message.match(needStashREGEX)) {
                exec("git stash", (error, stdout, stderr) => {
                    // As we stashed restart
                    notificationService.sendMsg("Server Stopped!", "Version: " + serverVersion + "\n" + `Hostname: ${os.hostname()}`);
                    process.exit(1);
                });
            }
            notificationService.sendMsg("Server Stopped!", "Version: " + serverVersion + "\n" + `Hostname: ${os.hostname()}`);
            log.error(`error: ${error.message}`);
            
            // As there was an issue restart
            process.exit(1);
        }
        if (stderr) {
            log.error(`stderr: ${stderr}`);
        }
        if(stdout.match(alreadUpToDateREGEX)) {
            log.log("Up to date!");
            return;
        }
        else {
            log.log(`stdout: ${stdout}`);
            notificationService.sendMsg("Server Stopped!", "Version: " + serverVersion + "\n" + `Hostname: ${os.hostname()}`);
            process.exit(1);
        }
    });
}