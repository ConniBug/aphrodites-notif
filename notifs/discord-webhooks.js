const { Webhook, MessageBuilder  } = require('discord-webhook-node');
const hook = new Webhook(require("../config.json").DiscordWebhook);

const APHRODITES_STORE_FAVICON_URL = `https://www.aphrodites.shop/img/favicon.png`;
/// <param name="productData">Simply all the new data about the product that updated</param>
/// <param name="title">A title describing the detected changed</param>
/// <param name="productData">Simply all the new data about the product that updated</param>
module.exports.run = async (productData, title, body, url) => {
    hook.setUsername(title);
    hook.setAvatar(APHRODITES_STORE_FAVICON_URL);
    
    const embed = new MessageBuilder()
        .setTitle(title)
        .setURL(url)
        .addField('Product Link', url, false)
        .setColor('#FFC0CB')
        .setDescription(body)
        .setFooter("Conni's Aphrodites Notifier", APHRODITES_STORE_FAVICON_URL)
        .setTimestamp();
        
    hook.send(embed);
};

module.exports.smallRun = async (title, body) => {
    hook.setUsername(title);
    hook.setAvatar(APHRODITES_STORE_FAVICON_URL);
    
    const embed = new MessageBuilder()
        .setTitle(title)
        .setDescription(body)
        .setFooter("Conni's Aphrodites Notifier", APHRODITES_STORE_FAVICON_URL)
        .setTimestamp();
        
    hook.send(embed);
};
