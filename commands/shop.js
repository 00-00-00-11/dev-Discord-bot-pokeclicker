const { MessageEmbed } = require('discord.js');
const { getAmount, removeAmount } = require('../database.js');
const { shopItems, postPages } = require('../helpers.js');

const generateCode = (discord_id, code_name) => {
  code_name = `[Discord] ${code_name}`;
  const val = discord_id ^ parseInt(code_name.replace(/(\W|_)/g, ''), 36);
  return (val > 0 ? val : -val).toString(36).toUpperCase();
};

module.exports = {
  name        : 'shop',
  aliases     : [],
  description : 'View stuff you can buy for your money',
  args        : ['page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['SEND_MESSAGES'],
  execute     : async (msg, args) => {
    let [ page = 1 ] = args;

    if (isNaN(page) || page <= 0) page = 1;

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
        .setFooter(`Balance: ${balance.toLocaleString('en-US')} | Page: ${index + 1}/${shopItems.length}`);
        //.setFooter(``);

      pages.push({ embed });
    });

    const botMsg = await postPages(msg, pages, page);
    
    await botMsg.react('737206931759824918');
    const buyFilter = (reaction, user) => reaction.emoji.id === '737206931759824918' && user.id === msg.author.id;
  
    // Allow reactions for up to x ms
    const timer = 1e5; // (100 seconds)
    const buy = botMsg.createReactionCollector(buyFilter, {time: timer});

    buy.on('collect', async r => {
      botMsg.reactions.removeAll().catch(O_o=>{});
      const itemID = (botMsg.embeds[0].footer.text.match(/(\d+)\//) || [])[1];

      // Item doesn't exist or couldn't get item ID
      if (!itemID || !shopItems[itemID - 1]) {
        const embed = new MessageEmbed()
          .setColor('#e74c3c')
          .setDescription([
            msg.author,
            'Failed to purchase item',
            'Something wen\'t wrong, try again later..',
          ]);
        return msg.channel.send({ embed });
      }

      const item = shopItems[itemID - 1];
      const currentBalance = await getAmount(msg.author);

      // Item too expensive
      if (item.price > currentBalance) {
        const embed = new MessageEmbed()
          .setColor('#e74c3c')
          .setDescription([
            msg.author,
            `**${item.name}** Failed to purhase!`,
            '',
            '_you cannot afford this item_',
          ])
          .setThumbnail(item.image)
          .setFooter(`Balance: ${currentBalance.toLocaleString('en-US')}`);

        return msg.channel.send({ embed });
      }

      // Purchase item
      const remainingBalance = await removeAmount(msg.author, item.price);
      const embed = new MessageEmbed()
        .setColor('#2ecc71')
        .setDescription([
          msg.author,
          `**${item.name}** Successfully purchased!`,
          '',
          '_code will be sent to you via direct message_',
        ])
        .setThumbnail(item.image)
        .setFooter(`Balance: ${remainingBalance.toLocaleString('en-US')}`);

      msg.channel.send({ embed });

      const userEmbed = new MessageEmbed()
        .setColor('#2ecc71')
        .setDescription([
          `**${item.name}** Successfully purchased!`,
          '_Enter the following code in game to claim:_',
          '```',
          generateCode(msg.author.id, item.name),
          '```',
        ])
        .setThumbnail(item.image)
        .setFooter(`Balance: ${remainingBalance.toLocaleString('en-US')}`);

      msg.author.send({ embed: userEmbed });
    });
  },
};
