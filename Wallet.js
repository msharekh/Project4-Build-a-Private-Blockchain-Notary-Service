
const level = require('level');
const db = level('./wallet-db')

/* ===== Wallet Class ==============================
|  Class with a constructor for Wallet 			   |
|  ===============================================*/

class Wallet{
    constructor(address){
        this.walletAddress = address,
        this.requestTimeStamp = new Date().getTime().toString().slice(0,-3),
        this.message = "",
        this.validationWindow = 0

    }
    addWallet(address,wallet){

        return new Promise(function(resolve,reject){


        db.put(address, JSON.stringify(wallet))
        .then(function () { 
            return db.get(address) 
        })
        .then(function (value) { 
            let jsonValue=JSON.parse(value);
            console.log(jsonValue)
            resolve(jsonValue) 
        })
         
        .catch(function (err) { 
            console.error(err) 
        })
            
            

        })
        
        }
    }


module.exports.Wallet = Wallet;