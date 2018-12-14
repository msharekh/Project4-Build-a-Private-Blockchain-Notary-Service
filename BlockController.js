const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockChainClass = require('./BlockChain.js');
const RequestClass=  require('./Request.js');
const bitcoinMessage = require('bitcoinjs-message'); 

const TimeoutRequestsWindowTime = 5*60*1000;


function c(txt){
    console.log(txt);
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
}
/**
* Controller Definition to encapsulate routes to work with blocks
*/
class BlockController {
    
    /**
    * Constructor to create a new BlockController, you need to initialize here all your endpoints
    * @param {*} app 
    */
    constructor(app) {
        this.app = app;
        this.blocks = [];
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
        this.validate();
        
        this.mempool = [];
        this.timeoutRequests = [];
    }
    
    /**
    * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
    */
    
    getBlockByIndex() {
        this.app.get("/block/:blockheight", (req, res) => {
            // Add your code here
            var blockheight=req.params.blockheight;
            
            
            // this.initializeMockData();
            
            // this.blocks[blockheight];
            
            console.log(`\n\n*** getBlockByBlockheight req blockheight= ${blockheight} ***`);
            
            // try {
            
            // } catch (error) {
            
            // }
            
            
            
            let bc = new BlockChainClass.BlockChain();
            
            bc.getBlock(blockheight).then((b) => {
                c(JSON.parse(b))
                res.send(JSON.parse(b));
            }).catch(err => {
                console.log('failed ', err); // { error: 'url missing in async task 2' }
                res.send(err);
            });
            
        });
    }
    
    /**
    * Implement a POST Endpoint to add a new Block, url: "/api/block"
    */
    
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            
            // var blockbody=JSON.parse(req);
            
            // var obj={
            //     type:"POST",
            //     hash:req.body.hash,
            //     height:req.body.height,
            //     body:req.body.body,
            //     time:req.body.time,
            //     previousBlockHash:req.body.previousBlockHash
            // };
            
            console.log(`\n\n*** postNewBlock \t {BlockData} ***`);
            console.log(req.body);
            
            if(isEmpty(req.body)) {
                // if Object is empty it return true
                
                res.send('Wrong entry, no block object found!');
                
                
                
                
            } 
            else {
                // Object is NOT empty
                
                if (req.body.title!='') {
                    let bc = new BlockChainClass.BlockChain();
                    
                    bc.addBlock(new BlockClass.Block(req.body.title)).then((result) => {
                        // console.log('The response after adding should contain that block.js ');
                        res.send(JSON.parse(result));
                    }).catch(e => console.error(`.addBlock catch(${e})`)) ;
                } else {
                    res.send('Wrong entry, please enter again');
                }
                
                
            }
            
            
            
            
            
            
            
            
        });
    }
    
    requestValidation() {
        let self = this;
        self.app.post("/requestValidation", (req, res) => {
            
            // console.log(req.body);
            
            if(isEmpty(req.body)) {                 
                res.send('Wrong entry, no data object found!');
            } 
            else {   
                /*
                REQUEST:
                { "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc" }
                curl -X POST \
                http://localhost:8000/requestValidation \
                -H 'Content-Type: application/json' \
                -H 'cache-control: no-cache' \
                -d '{ "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc" }'
                */                
                
                /*
                {
                    "walletAddress": "1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                    "requestTimeStamp": "1544451269",
                    "message": "1Kc8NccSW4qieURf2AjikTzs99vq1oBerc:1544451269:starRegistry",
                    "validationWindow": 300
                }
                Message format = [walletAddress]:[timeStamp]:starRegistry
                */
 
               let request=new RequestClass.Request(req.body.address);
               request.message=`${request.walletAddress}:${request.requestTimeStamp}:starRegistry`;
               request.validationWindow=300;


               
                
                let result = self.AddRequestValidation(request)

                 
                res.send(result)

            }
        });
    }
    startTime(req) {
        let self=this

                       
        setTimeout(function(){

            self.startTime(req)
        }, 3*1000);
    }
    AddRequestValidation(req){
        let self = this;

        let isAddressExist=false;
        self.mempool.forEach(mem => {
            if (mem.walletAddress==req.walletAddress) {
                isAddressExist=true
                req=mem
            }
        });
        let errMsg=""
        if (isAddressExist) {
            errMsg='Warrnign:	this address exist!'
            console.log(errMsg);
            if (req.validationWindow<=0) {
                errMsg='this request has expired!' 
                req.mempoolStatus="----EXPIRED----"
                console.log(errMsg);
 
            } else {
                req.mempoolStatus="Valid"

            }
            
         }else{
            req.mempoolStatus="Valid"
            self.mempool.push(req);
        }


        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;

        let timeStamp=new Date().getTime().toString().slice(0,-3)
        let msg=`length:${self.mempool.length} |${req.walletAddress.toString().slice(31,34)}| requestTimeStamp:${req.requestTimeStamp}:| Now:${timeStamp}| mempoolStatus:${req.mempoolStatus}| timeLeft:${timeLeft}`               
        console.log(msg); 

        req.validationWindow = timeLeft;

        let result={
            "walletAddress": req.walletAddress,
            "requestTimeStamp": req.requestTimeStamp,
            "message": req.message,
            "validationWindow": req.validationWindow
           }

        return req
    }
    
     
    validate(){
        let self = this;

        self.app.post("/message-signature/validate", (req, res) => {
            
            if(isEmpty(req.body)) {                 
                res.send('Wrong entry, no data object found!');
            } 
            else {   
            /*
            REQUEST:
            {
                "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
            }
            
            curl -X POST \
            http://localhost:8000/message-signature/validate \
            -H 'Content-Type: application/json' \
            -H 'cache-control: no-cache' \
            -d '{
                "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
            }'
            
            RESPONSE:
            {
                "registerStar": true,
                "status": {
                    "address": "1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                    "requestTimeStamp": "1544454641",
                    "message": "1Kc8NccSW4qieURf2AjikTzs99vq1oBerc:1544454641:starRegistry",
                    "validationWindow": 193,
                    "messageSignature": true
                }
            }
            
            */
            
            let isFoundInMempool=false
            let selectedRequest
           self.mempool.forEach(mem => {
            if (mem.walletAddress==req.body.address) {
                isFoundInMempool=true
                selectedRequest=mem
            }
        });
        let isValid
        let message
        let address
        let signature
        if (selectedRequest.validationWindow>=0) {
            // now check the signature
            message=selectedRequest.message
            address=selectedRequest.walletAddress
            signature = req.body.signature
            isValid= bitcoinMessage.verify(message, address, signature);

        }

        var result  = {
            "registerStar": true,
            "status": {
                "address": selectedRequest.walletAddress,
                "requestTimeStamp": selectedRequest.requestTimeStamp,
                "message": selectedRequest.message,
                "validationWindow": selectedRequest.validationWindow,
                "messageSignature": isValid
            }
        }
        console.log(result);
        res.send(result);
    }
    });
    }
    // getAllBlocks() {
    //     this.app.get("/blocks", (req, res) => {
    
    //         let bc = new BlockChainClass.BlockChain();
    
    //         bc.showBlockChain().then((result) => {
    //             res.send(result);
    //         })
    
    //     });
    // }
    
    /**
    * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
    */
    initializeMockData() {
        // if(this.blocks.length === 0){
        //     for (let index = 0; index < 10; index++) {
        //         let blockAux = new BlockClass.Block(`Test Data #${index}`);
        //         blockAux.height = index;
        //         blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
        //         this.blocks.push(blockAux);
        //     }
        // }
        // let bc = new BlockChainClass.BlockChain();
        // (function theLoop (i) {
        //     setTimeout(function () {
        //       let blockTest = new BlockClass.Block("Test Block - " + (i + 1));
        //       bc.addBlock(blockTest).then((result) => {
        //         console.log(result);
        //         i++;
        //         if (i < 10) theLoop(i);
        //     }).catch(e => console.error(`.addBlock catch(${e})`))
        
        //     }, 1000);
        //   })(0);
        
        
    }
    
}

/**
* Exporting the BlockController class
* @param {*} app 
*/
module.exports = (app) => { 
    return new BlockController(app);
}