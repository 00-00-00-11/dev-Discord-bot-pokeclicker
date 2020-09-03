const betRegex = /^(\d+|all|half|quater)$/;

const validBet = bet => betRegex.test(bet) && +bet > 0;

const calcBetAmount = (bet, balance) => {
  switch(bet) {
    case 'all':
      return balance;
    case 'half':
      return Math.max(1, Math.floor(balance / 2));
    case 'quater':
      return Math.max(1, Math.floor(balance / 4));
    default:
      return +bet;
  }
};

module.exports = {
  betRegex,
  validBet,
  calcBetAmount,
};
