const { MessageEmbed } = require('discord.js');
const { quizChannelID, website } = require('../config.js');
const { getAmount, addAmount } = require('../database.js');
const {
  pokemonList,
  randomFromArray,

  // unused
  LevelType,
  PokemonType,
  EvolutionType,
  GameConstants,
  PokemonLocationType,
  pokemonTypeIcons,
  gameVersion,
} = require('../helpers.js');

const money_icon = '<:money:737206931759824918>';


const newQuiz = async (guild) => {
  const quiz_channel = await guild.channels.cache.find(c => c.id == quizChannelID);
  if (!quiz_channel) return;

  const quiz = randomFromArray(quizTypes)();

  const bot_message = await quiz_channel.send({ embed: quiz.embed });

  const filter = m => quiz.answer.test(m.content);

  // Time limit in minutes
  const timeLimit = (25 + Math.floor(Math.random() * 5)) * 60 * 1000;

  // errors: ['time'] treats ending because of the time limit as an error
  quiz_channel.awaitMessages(filter, { max: 1, time:  timeLimit, errors: ['time'] })
    .then(async collected => {
      const m = collected.first();

      const balance = await addAmount(m.author, quiz.amount);

      const embed = new MessageEmbed()
        .setDescription([
          `${m.author}`,
          '**CORRECT!**',
          `**+${quiz.amount} ${money_icon}**`,
        ])
        .setFooter(`Balance: ${balance.toLocaleString('en-US')}`)
        .setColor('#2ecc71');
      m.channel.send({ embed });

      const botEmbed = bot_message.embeds[0];
      botEmbed.setDescription(`${botEmbed.description.split('\n').map(l => `~~${l.trim()}~~`).join('\n')}`)
        .setFooter(`Answered by ${m.member ? m.member.displayName : 'someone'}`)
        .setColor('#e74c3c');
      bot_message.edit({ embed: botEmbed });
    })
    .catch(collected => {
      const botEmbed = bot_message.embeds[0];
      botEmbed.setDescription(`${botEmbed.description.split('\n').map(l => `~~${l.trim()}~~`).join('\n')}`)
        .setFooter('Out of time!')
        .setColor('#e74c3c');
      bot_message.edit({ embed: botEmbed });
    });

  setTimeout(() => newQuiz(guild), timeLimit);
};

const whosThatPokemon = () => {
  const pokemon = randomFromArray(pokemonList);
  const answer = new RegExp(`^${pokemon.name.replace(/\s?\(.+/, '')}\\b`, 'i');
  const amount = Math.floor(Math.random() * 8) * 10 + 30;

  const shiny = !Math.floor(Math.random() * 128);

  const embed = new MessageEmbed()
    .setTitle('Who\'s that Pokemon?')
    .setDescription(`Name the Pokemon!\n**+${amount} ${money_icon}**`)
    .setThumbnail(`${website}assets/images/${shiny ? 'shiny' : ''}pokemon/${pokemon.id}.png`)
    .setColor('#3498db');

  return {
    embed,
    answer,
    amount,
  };
};

const quizTypes = [
  whosThatPokemon,
  whosThatPokemon,
];

module.exports = {
  newQuiz,
};
