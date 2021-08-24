const log = require('@connibug/js-logging');

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
let alreadUpToDateREGEX = new RegExp('Already.up.to.date');

module.exports.handleCD = () => {
    exec("git stash", (error, stdout, stderr) => {
        exec("git pull", (error, stdout, stderr) => {
            if (error) {
                log.error(`error: ${error.message}`);
                
                // As there was an issue restart
                process.exit(1);
            }
            if (stderr) {
                log.error(`stderr: ${stderr}`);
            }
            if(stdout.match(alreadUpToDateREGEX)) {
                return;
            }
            else {
                log.log(`stdout: ${stdout}`);
                process.exit(1);
            }
        });
    });
}