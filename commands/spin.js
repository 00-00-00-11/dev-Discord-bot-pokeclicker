const { MessageEmbed } = require('discord.js');
const { getAmount, addAmount } = require('../database.js');

const multipliers = [1.5, 1.7, 2.4, 0.2, 1.2, 0.1, 0.3, 0.5];
const arrows      = ['↖️', '⬆️', '↗️','⬅️','➡️', '↙️', '⬇️', '↘️'];

const getMultiplier = () => multipliers[Math.floor(Math.random() * (multipliers.length))];
const getArrow = (multiplier) => arrows[multipliers.findIndex(m => m == multiplier)];

module.exports = {
  name        : 'spin',
  aliases     : ['wheel'],
  description : 'Short description',
  args        : ['amount'],
  guildOnly   : false,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
  execute     : async (msg, args) => {
    let [ bet ] = args;

    if (isNaN(bet) && !['all', 'half'].includes(bet) || bet <= 0) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nInvalid bet amount: \`${bet}\``);
      return msg.channel.send({ embed });
    }

    const balance = await getAmount(msg.author);

    switch(bet) {
      case 'all':
        bet = balance;
        break;
      case 'half':
        bet = Math.floor(balance / 2);
        break;
      default:
        bet = +bet;
        break;
    }

    if (bet > balance) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nNot enough coins.`);
      return msg.channel.send({ embed });
    }

    const multiplier = getMultiplier();
    const arrow = getArrow(multiplier);
    const winnings = Math.floor(bet * multiplier);

    const output = [
      msg.author,
      `**Winnings: ${winnings.toLocaleString('en-US')} <:money:737206931759824918>**`,
      '',
      `\`${multipliers.slice(0, 3).map(i => `[${i}]`).join('')}\``,
      `\`[${multipliers[3]}]\` ${arrow} \`[${multipliers[4]}]\``,
      `\`${multipliers.slice(5, 8).map(i => `[${i}]`).join('')}\``,
    ].join('\n');

    addAmount(msg.author, winnings - bet);

    const embed = new MessageEmbed()
      .setColor(multiplier > 1 ? '#2ecc71' : '#e74c3c')
      .setDescription(output)
      .setFooter(`Balance: ${(balance + winnings - bet).toLocaleString('en-US')}`);
    return msg.channel.send({ embed });
  },
};
