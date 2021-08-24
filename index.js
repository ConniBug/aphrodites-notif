const { exec } = require("child_process");

exec("git pull", (error, stdout, stderr) => {
    if (error) {
        let re = new RegExp('Please.commit.your.changes');
        if(error.message.match(re)) {
            exec("git stash", (error, stdout, stderr) => {
                process.exit(1);
            });
        }
        console.log(`error: ${error.message}`);
        return;
    }
    let re = new RegExp('Already.up.to.date');
    if(stdout.match(re)) {
        console.log("Up to date dw");
        return;
    }
    else {
        console.log(`stdout: ${stdout}`);
    }
    process.exit(1);
});


var packageInfo = require("./package.json");
var serverVersion = packageInfo.version;
// require the library, main export is a function

// Import external code.
const HasChanged = require("./Utils").HasChanged;

const notificationService = require("./notificationHandler");
const { capitalCase } = require("change-case");
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const log = require('@connibug/js-logging');
const fs = require('fs');

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

var terminated = false;
var timeBetweenStockChecks = 7.5; // seconds
setInterval(async function(){
    try {
        var cachedProducts = [];

        // Get cached products
        if (fs.existsSync("./pageData/dat.json")) {
            // Old dat exists
            cachedProducts = await fs.readFileSync("./pageData/dat.json");
            cachedProducts = JSON.parse(cachedProducts);
        } else {
            // Populate cache
            cachedProducts = await getAllRemoteProducts();
            if(!terminated) fs.writeFileSync("./pageData/dat.json", JSON.stringify(await cachedProducts, null, 4));
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

        fs.writeFileSync("./pageData/dat.json", JSON.stringify(await newProducts, null, 4));
    } catch (error) {
        log.error(error);
    }
}, timeBetweenStockChecks * 1000);

process.on('SIGTERM', () => {
    terminated = true;
    console.info('SIGTERM signal received.');
    notificationService.sendMsg("Server Stopped!", "Version: " + serverVersion + "\n" + `Hostname: ${os.hostname()}`);
});

const os = require('os');
notificationService.sendMsg("Server Started!", "Version: " + serverVersion + "\n" + `Hostname: ${os.hostname()}`);

// Simple Cont Delivery

var http = require('http');
http.createServer(function (req, res) {
    if(req.socket.parser.incoming.url == "/restart") {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("Doing");
        exec("git pull", (error, stdout, stderr) => {
            if (error) {
                let re = new RegExp('Please.commit.your.changes');
                if(error.message.match(re)) {
                    exec("git stash", (error, stdout, stderr) => {
                        process.exit(1);
                    });
                }
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                process.exit(1);
            }
            let re = new RegExp('Already.up.to.date');
            if(stdout.match(re)) {
                console.log("Up to date dw");
                process.exit(1);
            }
            else {
                console.log(`stdout: ${stdout}`);
                process.exit(1);
            }
            process.exit(1);
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("Ok");
    }
  }).listen(9600);