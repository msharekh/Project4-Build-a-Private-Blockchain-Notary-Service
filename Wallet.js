
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
    async getWallet(address){
        
        //resultGetWalletPromise
        // create a new promise inside of the async function
        let getWalletPromise = new Promise((resolve, reject) => {
            
            resolve(db.get(address)) 
            // return db.get(address)
        });
        
        // wait for the promise to resolve
        let resultGetWalletPromise = await getWalletPromise;
        
        // console log the result (true)
        console.log('getWallet\n');
        console.log(resultGetWalletPromise);
    }
    async addWallet(address,wallet){
        
        //resultPutWalletPromise
        // create a new promise inside of the async function
        let putWalletPromise = new Promise((resolve, reject) => {
            
            
            
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

        });
        
        // wait for the promise to resolve
        let resultPutWalletPromise = await putWalletPromise;
        
        // console log the result (true)
        console.log('putWallet\n');
        console.log(resultPutWalletPromise);        

        }
   
        
    }


module.exports.Wallet = Wallet;