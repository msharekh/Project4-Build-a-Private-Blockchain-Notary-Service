var level = require('level')
 
const WalletClass = require('./Wallet.js');
 
const db = level('./wallet-db')
 
let wallet=new WalletClass.Wallet();

wallet.walletAddress="19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL";
// wallet.requestTimeStamp="1544451269";
wallet.message=`${wallet.walletAddress}:${wallet.requestTimeStamp}:starRegistry`;
wallet.validationWindow=300

db.put(wallet.walletAddress, JSON.stringify(wallet))
  .then(function () { return db.get(wallet.walletAddress) })
  .then(function (value) { console.log(JSON.parse(value)) })
  .catch(function (err) { console.error(err) })