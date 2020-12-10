const { MessageEmbed } = require('discord.js');
const { quizChannelID, website } = require('../config.js');
const { addAmount, addStatistic } = require('../database.js');
const {
  pokemonList,
  PokemonType,
  randomFromArray,
} = require('../helpers.js');

const money_icon = '<:money:737206931759824918>';


const newQuiz = async (guild) => {
  if (!quizChannelID) return;
  const quiz_channel = await guild.channels.cache.find(c => c.id == quizChannelID);
  if (!quiz_channel) return;

  const quiz = randomFromArray(quizTypes)();

  const bot_message = await quiz_channel.send({ embed: quiz.embed });

  const filter = m => quiz.answer.test(m.content);

  // Time limit in minutes (5 → 30 minutes)
  const timeLimit = (Math.floor(Math.random() * 26) + 5) * 60 * 1000;

  // errors: ['time'] treats ending because of the time limit as an error
  quiz_channel.awaitMessages(filter, { max: 1, time:  timeLimit, errors: ['time'] })
    .then(async collected => {
      const m = collected.first();

      const balance = await addAmount(m.author, quiz.amount);
      addStatistic(m.author, 'quiz_answered');
      addStatistic(m.author, 'quiz_coins_won', quiz.amount);

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

const pokemonType = () => {
  const pokemon = randomFromArray(pokemonList);
  const types = pokemon.type.map(t => PokemonType[t]);

  const answer = new RegExp(`^(${types.join('|') + (types.length > 1 ? `)\\s+?(${types.join('|')}` : '')})\\b`, 'i');
  const amount = Math.floor(Math.random() * 8) * 10 + 30;

  const shiny = !Math.floor(Math.random() * 128);

  const embed = new MessageEmbed()
    .setTitle('What\'s the type?')
    .setDescription(`What is this Pokemons type(s)?\n**+${amount} ${money_icon}**`)
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
  whosThatPokemon,
  pokemonType,
];

module.exports = {
  newQuiz,
};
