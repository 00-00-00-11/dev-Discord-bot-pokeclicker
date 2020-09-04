const { MessageEmbed } = require('discord.js');
const { getAmount, removeAmount } = require('../database.js');
const { shopItems, postPages, SeededRand } = require('../helpers.js');
const { website } = require('../config.json');

const generateCode = (discordID, code) => {
  discordID = +discordID;
  // reverse the string (for names that are similar - forms)
  const codeSeed = code.split('').reverse()
    // map to the character code
    .map(l => l.charCodeAt(0))
    // multiply the numbers (should be random enough)
    .reduce((s,b) => s * (b / 10), 1);

  SeededRand.seed(discordID + codeSeed);

  const arr = [];
  for (let i = 0; i < 14; i++) {
    let char;
    while (char == undefined || char.length != 1) {
      char = SeededRand.intBetween(0, 35).toString(36);
    }
    arr.push(char);
  }

  arr[4] = '-';
  arr[9] = '-';

  return arr.join('').toUpperCase();
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
        .setThumbnail(website + item.image)
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

      // Create the embed now and edit as needed
      const embed = new MessageEmbed()
        .setThumbnail(website + item.image)
        .setFooter(`Balance: ${currentBalance.toLocaleString('en-US')}`);

      // Item too expensive
      if (item.price > currentBalance) {
        embed.setColor('#e74c3c')
          .setDescription([
            msg.author,
            `**${item.name}** Failed to purhase!`,
            '',
            '_you cannot afford this item_',
          ]);

        return msg.channel.send({ embed });
      }

      // Purchase item
      const remainingBalance = await removeAmount(msg.author, item.price);
      embed.setColor('#2ecc71')
        .setDescription([
          msg.author,
          `**${item.name}** Successfully purchased!`,
          '',
          '_code will be sent to you via direct message_',
        ]);

      msg.channel.send({ embed });

      embed.setColor('#2ecc71')
        .setDescription([
          `**${item.name}** Successfully purchased!`,
          '_Enter the following code in game to claim:_',
          '```',
          generateCode(msg.author.id, item.name),
          '```',
        ]);

      msg.author.send({ embed });
    });
  },
};
