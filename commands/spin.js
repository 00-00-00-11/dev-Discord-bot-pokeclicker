const { MessageEmbed } = require('discord.js');
const { getDB, getAmount, addAmount } = require('../database.js');

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
    const multiplier = getMultiplier();
    const arrow = getArrow(multiplier);

    const output = [
      '```ini',
      multipliers.slice(0, 3).map(i => `[${i}]`).join(' '),
      '',
      `[${multipliers[3]}]  ${arrow}  [${multipliers[4]}]`,
      '',
      multipliers.slice(5, 8).map(i => `[${i}]`).join(' '),
      '```',
    ].join('\n');
    const embed = new MessageEmbed().setColor(multiplier > 0 ? '#2ecc71' : '#e74c3c').setDescription(output);
    return msg.channel.send({ embed });
  },
};
