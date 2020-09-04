const { MessageEmbed } = require('discord.js');
const { getAmount, addAmount } = require('../database.js');
const { betRegex, validBet, calcBetAmount } = require('../helpers.js');

const multipliers = [
  300,
  100,
  15,
  15,
  8,
  8,
];
const icons       = [
  '<:slots_7:751322075578499093>',
  '<:slots_r:751322076115370044>',
  '<:slots_pikachu:751322076031483944>',
  '<:slots_psyduck:751322076052455444>',
  '<:slots_magnemite:751322076014706698>',
  '<:slot_shelder:751322075481768027>',
  '<:slots_berry:751322075955724368>',
];

const spinSlots = () => {
  const spinIcons = [[],[],[]];
  spinIcons.forEach((col, index) => {
    const column = [...icons];
    if (index == 2) column.splice(column.length - 1);
    while (col.length < 3) {
      col.push(column.splice(Math.floor(Math.random() * column.length), 1)[0]);
    }
  });
  return spinIcons;
};

const calcWinningsMultiplier = (slotIcons) => {
  let multiplier = 0;

  const row1 = slotIcons.map(r => r[0]);
  const row2 = slotIcons.map(r => r[1]);
  const row3 = slotIcons.map(r => r[2]);
  console.log([...new Set(row1)]);
  console.log([...new Set(row2)]);
  console.log([...new Set(row3)]);
  // Each row
  if (new Set(row1).size == 1) multiplier += multipliers[icons.findIndex(i => i == row1[0])];
  if (new Set(row2).size == 1) multiplier += multipliers[icons.findIndex(i => i == row2[0])];
  if (new Set(row3).size == 1) multiplier += multipliers[icons.findIndex(i => i == row3[0])];
  // Diagonals
  if (new Set([row1[0], row2[1], row3[2]]).size == 1) multiplier += multipliers[icons.findIndex(i => i == row1[0])];
  if (new Set([row3[0], row2[1], row1[2]]).size == 1) multiplier += multipliers[icons.findIndex(i => i == row3[0])];

  console.log([...new Set([row1[0], row2[1], row3[2]])]);
  console.log([...new Set([row3[0], row2[1], row1[2]])]);
  // Berries
  const berry = icons[6];
  if (row1[0] == berry) {
    if (row1[1] == berry) multiplier += 6;
    else if (row2[1] == berry) multiplier += 6;
    else multiplier += 2;
  }
  if (row2[0] == berry) {
    if (row2[1] == berry) multiplier += 6;
    else multiplier += 2;
  }
  if (row3[0] == berry) {
    if (row3[1] == berry) multiplier += 6;
    else if (row2[1] == berry) multiplier += 6;
    else multiplier += 2;
  }

  // Divided by 3 as cost is 1 coin per line, we will just assume player is playing all 3 lines
  return Math.floor((multiplier / 3) * 100) / 100;
};

module.exports = {
  name        : 'slots',
  aliases     : ['slot'],
  description : 'Spin the slots for a prize',
  args        : ['amount'],
  guildOnly   : true,
  cooldown    : 0.5,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['SEND_MESSAGES'],
  execute     : async (msg, args) => {
    let bet = args.find(a => betRegex.test(a));

    // Check the bet amount is correct
    if (!validBet(bet)) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nInvalid bet amount: \`${bet}\``);
      return msg.channel.send({ embed });
    }

    const balance = await getAmount(msg.author);

    bet = calcBetAmount(bet, balance);

    if (bet > balance || !balance || balance <= 0) {
      const embed = new MessageEmbed().setColor('#e74c3c').setDescription(`${msg.author}\nNot enough coins.`);
      return msg.channel.send({ embed });
    }

    const slotIcons = spinSlots();

    const multiplier = calcWinningsMultiplier(slotIcons);
    const winnings = Math.floor(bet * multiplier);

    const output = [
      msg.author,
      '',
      `║ ${slotIcons.map(r => r[0]).join(' ║ ')} ║`,
      `║ ${slotIcons.map(r => r[1]).join(' ║ ')} ║`,
      `║ ${slotIcons.map(r => r[2]).join(' ║ ')} ║`,
      '',
      `**Winnings: ${winnings.toLocaleString('en-US')} <:money:737206931759824918>**`,
    ];

    addAmount(msg.author, winnings - bet);

    const embed = new MessageEmbed()
      .setColor(multiplier >= 1 ? '#2ecc71' : '#e74c3c')
      .setDescription(output)
      .setFooter(`Balance: ${(balance + winnings - bet).toLocaleString('en-US')}`);
    return msg.channel.send({ embed });
  },
};
