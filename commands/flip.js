const { MessageEmbed } = require('discord.js');
const { getAmount, addAmount } = require('../database.js');

const coinSides = {
  heads: 1,
  h: 1,
  tails: 0,
  t: 0,
  // Game currency
  dungeon: 1,
  dungeontoken: 1,
  d: 1,
  dt: 1,
  farm: 0,
  farmpoint: 0,
  f: 0,
  fp: 0,
};

const coinImage = {
  1: 'https://pokeclicker-dev.github.io/pokeclicker/assets/images/currency/dungeonToken.png',
  0: 'https://pokeclicker-dev.github.io/pokeclicker/assets/images/currency/farmPoint.png',
};

const flipCoin = () => {
  return Math.round(Math.random());
};

module.exports = {
  name        : 'flip',
  aliases     : ['coin'],
  description : 'Flip a coin for a prize',
  args        : ['amount', 'side (h|t)'],
  guildOnly   : false,
  cooldown    : 0.5,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
  execute     : async (msg, args) => {
    let bet = args.find(a => /^(\d+|all|half|quater)$/.test(a));
    let side = args.find(a => new RegExp(`^(${Object.keys(coinSides).join('|')})$`).test(a));

    if (!bet || +bet <= 0) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nInvalid bet amount: \`${bet}\``);
      return msg.channel.send({ embed });
    }

    if (!side || coinSides[side] == undefined) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nInvalid coin side selected: \`${side}\``);
      return msg.channel.send({ embed });
    }
    side = coinSides[side.toLowerCase()];

    const balance = await getAmount(msg.author);

    switch(bet) {
      case 'all':
        bet = balance;
        break;
      case 'half':
        bet = Math.max(1, Math.floor(balance / 2));
        break;
      case 'quater':
        bet = Math.max(1, Math.floor(balance / 4));
        break;
      default:
        bet = +bet;
        break;
    }

    if (bet > balance) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nNot enough coins.`);
      return msg.channel.send({ embed });
    }

    const coinSide = flipCoin();
    const win = coinSide == side;

    const winnings = Math.floor((bet + bet) * win);

    const output = [
      msg.author,
      `**Winnings: ${winnings.toLocaleString('en-US')} <:money:737206931759824918>**`,
    ].join('\n');

    addAmount(msg.author, winnings - bet);

    const embed = new MessageEmbed()
      .setColor(win ? '#2ecc71' : '#e74c3c')
      .setThumbnail(coinImage[coinSide])
      .setDescription(output)
      .setFooter(`Balance: ${(balance + winnings - bet).toLocaleString('en-US')}`);
    return msg.channel.send({ embed });
  },
};
