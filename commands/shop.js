const { MessageEmbed } = require('discord.js');
const { getAmount } = require('../database.js');
const { shopItems, postPages } = require('../helpers.js');

module.exports = {
  name        : 'shop',
  aliases     : [],
  description : 'View stuff you can buy for your money',
  args        : ['page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
  execute     : async (msg, args) => {
    const balance = await getAmount(msg.author);

    const pages = [];

    shopItems.forEach((item, index) => {
      const embed = new MessageEmbed()
        .setColor('#3498db')
        .setDescription(msg.author)
        .setThumbnail(item.image)
        .addField('Name', item.name, true)
        .addField('Price', `${item.price} <:money:737206931759824918>`, true)
        .addField('Description', item.description)
        .setFooter(`Page: ${index + 1}/${shopItems.length}`);
        //.setFooter(`Balance: ${balance.toLocaleString('en-US')}`);

      pages.push({ embed });
    });

    return postPages(msg, pages);
  },
};
