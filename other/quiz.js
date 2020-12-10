const { MessageEmbed } = require('discord.js');
const { quizChannelID, website } = require('../config.js');
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
  if (!quiz_channel) return console.log('no channel found');

  console.log('starting quiz');
  const quiz = randomFromArray(quizTypes)();

  const bot_message = await quiz_channel.send({ embed: quiz.embed });

  const filter = m => quiz.answer.test(m.content);
  // errors: ['time'] treats ending because of the time limit as an error (1 minutes)
  quiz_channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
    .then(collected => {
      const m = collected.first();
      bot_message.delete().catch(e=>{});
      m.delete().catch(e=>{});
      m.reply(`\n+ ${quiz.amount} ${money_icon}`);
    })
    .catch(collected => {
      bot_message.edit('Better luck next time..');
    });
};

const whosThatPokemon = () => {
  const pokemon = randomFromArray(pokemonList);
  const answer = new RegExp(`^${pokemon.name}\\b`, 'i');
  const amount = Math.floor(Math.random() * 8) * 10 + 30;

  const shiny = !Math.floor(Math.random() * 128);

  const embed = new MessageEmbed()
    .setTitle('Who\'s that Pokemon?')
    .setDescription(`Name this Pokemon to earn ${amount} ${money_icon}!`)
    .setImage(`${website}assets/images/${shiny ? 'shiny' : ''}pokemon/${pokemon.id}.png`)
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
