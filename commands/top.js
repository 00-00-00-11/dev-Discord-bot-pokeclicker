const { MessageEmbed } = require('discord.js');
const { getTop } = require('../database.js');

module.exports = {
  name        : 'top',
  aliases     : ['leaderboard'],
  description : 'Get a list of users with the most points',
  args        : ['amount(10)?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['MANAGE_MESSAGES'],
  execute     : async (msg, args) => {
    const amount = +(args.find(arg=>/^\d+$/.test(arg)) || 10);

    // Check user has entered a valid amount
    if (isNaN(amount) || amount < 1 || amount > 40) return msg.channel.send('Invalid amount specified, Must be between 1 and 40...');

    const results = await getTop(amount);

    const embed = new MessageEmbed()
      .setTitle(`__***Top ${results.length} Trainers:***__`)
      .setColor('#3498db');
      
    results.forEach((res, place) => {
      const user = msg.guild.members.cache.get(res.user);
      embed.addField(`**#${place + 1}**  ${user ? user.user.tag : 'Inactive Member'}`, `${res.amount ? res.amount.toLocaleString('en-NZ') : 0} <:money:737206931759824918>`, true);
    });

    msg.channel.send('Gathering Data...').then(m=>m.edit({ embed }));
  },
};
