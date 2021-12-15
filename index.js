const log = require('@connibug/js-logging');

var packageInfo = require("./package.json");
var serverVersion = packageInfo.version;
const os = require('os');
// require the library, main export is a function

// Import external code.
const HasChanged = require("./Utils").HasChanged;
const handleCD = require("./Utils").handleCD;

const notificationService = require("./notificationHandler");
notificationService.setup(log);
const { capitalCase } = require("change-case");
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const fs = require('fs');

handleCD();

const { exec } = require("child_process");
var mostRecentUpdateReson = "";
exec("git log -1 --pretty=%B", (error, stdout, stderr) => {
    mostRecentUpdateReson =  stdout;
});
// Amount of pages the site has
pageCount = 2;

async function getProductsFromPage(pageNum)
{
    const params = new URLSearchParams();
    params.append("request", "shop");
    params.append("page", pageNum);

    var page = await fetch('https://www.aphrodites.shop/admin/php/ajax.php', { method: 'POST', body: params });
    page = await page.json();
    page = page.products;
    return page;
}

function doesExist(array, pidToCheckFor) {
    array.forEach(e => {
        if(e.pid == pidToCheckFor) return true;
    });
    return false;
}

function mergeAvoidDupes(main, second) {
    second.forEach(e => {
        if(!doesExist(main, e.pid)) {
            main.push(e);
        }
    });
    return main;
}

async function getAllRemoteProducts() {
    var products = []; 
    for(var i = 1; i <= pageCount; i++) {
        var tmp = await getProductsFromPage(i);
        products = mergeAvoidDupes(products, tmp);
    }
    return products;
}

function foundItem(oldDat, newDat) {
    var changed = HasChanged(oldDat, newDat);
    if(!changed) return;

    log.log("=====================================================================================");
    log.log(`Aphrodites Store - ${capitalCase(changed)} Update`);
    log.log(`${oldDat.name}'s ${capitalCase(changed)} has updated from ${oldDat[changed]} to ${newDat[changed]}`);
    log.log(`https://www.aphrodites.shop/product/${newDat.ref}/${newDat.nameurl}`);
    log.log("=====================================================================================");

    notificationService.sendNotif(newDat, 
        `Aphrodites Store - ${capitalCase(changed)} Update`, 
        `${oldDat.name}'s ${capitalCase(changed)} has updated from ${oldDat[changed]} to ${newDat[changed]}`,
        `https://www.aphrodites.shop/product/${newDat.ref}/${newDat.nameurl}`);
}

var timeBetweenStockChecks = 7.5; // seconds
setInterval(async function(){
        var cachedProducts = [];

        // Get cached products
        // Def should just cache this locally and open restore it on startup /shrug
        if (fs.existsSync("./pageData/dat.json")) {
            // Old dat exists
            cachedProducts = await fs.readFileSync("./pageData/dat.json");
            cachedProducts = JSON.parse(cachedProducts);
        } else {
            // Populate cache
            cachedProducts = await getAllRemoteProducts();
            fs.writeFileSync("./pageData/dat.json", JSON.stringify(await cachedProducts, null, 4));
        }

        // Get current up to date products
        var newProducts = await getAllRemoteProducts();

        // Match new products with old
        newProducts.forEach(newProduct => {
            cachedProducts.forEach(oldProduct => {
                if (newProduct.pid == oldProduct.pid) {
                    foundItem(oldProduct, newProduct);
                }
            });
        });

        try {
            fs.writeFileSync("./pageData/dat.json", JSON.stringify(await newProducts, null, 4));
        } catch (error) {
            log.error(error);
        }

        handleCD();
}, timeBetweenStockChecks * 1000);

function sayHi() {
    notificationService.sendMsg("Server Started!", "Version: " + serverVersion + "\n" + `Hostname: ${os.hostname()} \n Last Update Reason: ${mostRecentUpdateReson}`);
}
setTimeout(sayHi, 2000);