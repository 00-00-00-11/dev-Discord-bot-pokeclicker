const { getDB, getUserID, addAmount } = require('../database.js');

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const getLastClaimTime = async (user) => {
  const [
    db,
    user_id,
  ] = await Promise.all([
    getDB(),
    getUserID(user),
  ]);

  const { last_claim } = await db.get('SELECT last_claim FROM coins WHERE user=?', user_id) || { last_claim: '0' };
  return new Date(last_claim);
};

const setLastClaimTime = async (user) => {
  const [
    db,
    user_id,
  ] = await Promise.all([
    getDB(),
    getUserID(user),
  ]);

  const data = {
    $user_id: user_id,
    $date: new Date().toJSON(),
  };

  await db.run('UPDATE coins SET last_claim=$date WHERE user=$user_id', data);
};

module.exports = {
  name        : 'claim',
  aliases     : ['timely'],
  description : 'Short description',
  args        : [],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['SEND_MESSAGES'],
  execute     : async (msg, args) => {
    // Check if user claimed within the last 24 hours
    const lastClaim = await getLastClaimTime(msg.author);
    // TODO: display time left until next claim
    if (lastClaim >= (Date.now() - DAY)) return msg.reply('You\'ve already claimed your coins for today..');

    // Add the coins to the users balance, set last claimed time
    const dailyAmount = 100;
    // Add the balance then set last claim time (incase the user doesn't exist yet)
    const balance = await addAmount(msg.author, dailyAmount, 'coins');
    await setLastClaimTime(msg.author);
    return msg.reply(`Claimed ${dailyAmount.toLocaleString('en-US')} <:money:737206931759824918>,\nCurrent Balance: ${balance.toLocaleString('en-US')} <:money:737206931759824918>`);
  },
};
