module.exports = {
  betRegex: /^(\d+|all|half|quater)$/,
  validBet: bet => !(!bet || isNaN(bet) || bet <= 0),
  getBetAmount: (bet, balance) => {
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
  },
};
