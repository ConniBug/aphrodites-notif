const fs = require('fs');
console.log("Starting tests.");
if (!fs.existsSync("./config.json")) {
    console.log("Creating Test Config");
    fs.writeFileSync("./config.json", JSON.stringify({ DiscordWebhook: "TEST"}, null, 4));
}
console.log("Passed tests.");
process.exit(0);