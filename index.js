// Setup .env vars
require('dotenv').config();

// Import external code.
const HasChanged = require("./Utils").HasChanged;

const notificationService = require("./notificationHandler");
const { capitalCase } = require("change-case");
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const log = require('@connibug/js-logging');

// Amount of pages the site has
pageCount = 2;

let oldProductsList = [];
// Read the existing json and push new items to oldProductList
function readLocalPage(pageNum) {
    JSON.parse(fs.readFileSync(`./pageData/page${pageNum}.json`)).forEach(e => {
        const found = oldProductsList.find(element => e.pid > element.pid);
        if(!found) oldProductsList.push(e);
    });
}


async function getProductsFromPage(pageNum)
{
    const params = new URLSearchParams();
    params.append("request", "shop", "page", pageNum);

    var page = await fetch('https://www.aphrodites.shop/admin/php/ajax.php', { method: 'POST', body: params });
    page = await page.json();
    page = page.products;
    return page;
}

function doesExist(array, pidToCheckFor) {
    array.forEach(e => {
        if(e.pid == pidToCheckFor) {
            return true;
        }
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
        console.log("Page:", i, "size:", tmp.length)
        products = mergeAvoidDupes(products, tmp);
    }
    console.log("size:", products.length);
    return products;
}

function handleRemotePage(pageNum) {    
    const params = new URLSearchParams();
    params.append("request", "shop", "page", pageNum);

    fetch('https://www.aphrodites.shop/admin/php/ajax.php', { method: 'POST', body: params })
        .then(res => res.json())
        .then(res => checkProducts(res.products, true))
        .then(res => fs.writeFileSync(`./pageData/page${pageNum}.json`, JSON.stringify(res, null, 4)))
        .catch(e => log.error(e));
}

// Check given dataset
function checkProducts(products, shouldRebuildList = false) {
    // Should the array of old cached products be rebuilt
    if(shouldRebuildList) {
        oldProductsList = [];
        // Rebuild the old products list
        for(var num = 1; num <= pageCount; num++) {
            readLocalPage(num);
        }
    }

    // I should really use maps here but idc :)) this works <3
    products.forEach(newProduct => {
        oldProductsList.forEach(oldProduct => {
            if(newProduct.pid == oldProduct.pid) {
                foundItem(oldProduct, newProduct);
            }
        });
    });
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
    log.log();
}

const fs = require('fs');
// function process() {
//     for(var num = 1; num <= pageCount; num++) {
//         handleRemotePage(num);
//     }
// }

var timeBetweenStockChecks = 2; // seconds
setInterval(async function(){

    //try {
        var cachedProducts = [];

        // Get cached products
        if(fs.existsSync("./pageData/dat.json")) {
            // Old dat exists
            cachedProducts = await fs.readFileSync("./pageData/dat.json");
            cachedProducts = JSON.parse(cachedProducts);
        } else {
            // Populate cache
            cachedProducts = await getAllRemoteProducts();
            console.log(cachedProducts);
            fs.writeFileSync("./pageData/dat.json", JSON.stringify(await cachedProducts, null, 4));
        }
        console.log("Cached products:", cachedProducts.length);


        var newProducts = await getAllRemoteProducts();

        newProducts.forEach(newProduct => {
            cachedProducts.forEach(oldProduct => {
                if(newProduct.pid == oldProduct.pid) {
                    foundItem(oldProduct, newProduct);
                }
            });
        });
        //process();
        
//} catch(e) {
//log.log(e);
   // }
}, timeBetweenStockChecks * 1000);

//getAllProducts();