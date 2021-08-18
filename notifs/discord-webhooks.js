const { Webhook, MessageBuilder  } = require('discord-webhook-node');
const hook = new Webhook(process.env.DISCORD_WEBHOOK);

module.exports.run = async (allDat, title, body, url) => {
    const IMAGE_URL = `https://www.aphrodites.shop/img/favicon.png`;
    hook.setUsername(title);
    hook.setAvatar(IMAGE_URL);
 
    const embed = new MessageBuilder()
        .setTitle(title)
        .setURL(url)
        .addField('Product Link', url, false)
        .setColor('#FFC0CB')
        .setDescription(body)
        .setFooter("Conni's Aphrodites Notifier", `https://www.aphrodites.shop/img/favicon.png'`)
        .setTimestamp();
        
    hook.send(embed);
};