const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockChainClass = require('./BlockChain.js');
const RequestClass = require('./Request.js');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');

const TimeoutRequestsWindowTime = 5 * 60 * 1000;

function c(txt) {
  console.log(txt);
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

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
    this.controllerGetBlockByParam();
    this.mempool = [];
    this.timeoutRequests = [];
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */

  controllerGetBlockByParam() {
    let self = this;

    // TODO: S-12.	Use the URL:http://localhost:8000/stars/hash:[HASH]
    // TODO: S-14.	Use the URL:http://localhost:8000/stars/address:[ADDRESS]

    self.app.get('/stars/:param', (req, res) => {
      // Add your code here
      let param = req.params.param;

      let colonIndx = 0;
      colonIndx = param.indexOf(':');
      let parName = param.substr(0, colonIndx);
      let parValue = param.substr(colonIndx + 1, param.length);

      let bc;
      switch (parName) {
        case 'hash':
          console.log('hash', ':	', parValue);
          let hash = parValue;
          bc = new BlockChainClass.BlockChain();
          bc.getBlockByHash(hash)
            .then(b => {
              let block = JSON.parse(b);
              let encodedStory = block.body.star.story;
              console.log('encoded Story', '	', encodedStory);
              let deocdedStory = hex2ascii(encodedStory);

              // TODO: S-13.	The response includes entire star block contents and story decoded to ASCII.

              block.body.star.storyDecoded = deocdedStory;

              c(block);
              res.send(block);
            })
            .catch(err => {
              console.log('failed call by hash', err); // { error: 'url missing in async task 2' }
              res.send(err);
            });
          break;
        case 'address':
          console.log('address', ':	', parValue);
          let address = parValue;
          bc = new BlockChainClass.BlockChain();
          bc.getBlockByWalletAddress(address)
            .then(blocks => {
              let block = null;
              let WalletStarBlocks = [];
              blocks.forEach(b => {
                block = JSON.parse(b);

                let encodedStory = block.body.star.story;
                console.log('encoded Story', '	', encodedStory);
                let deocdedStory = hex2ascii(encodedStory);
                // TODO: S-15.	The response includes entire star block contents and story decoded to ASCII.

                block.body.star.storyDecoded = deocdedStory;
                WalletStarBlocks.push(block);
              });

              c(WalletStarBlocks);
              res.send(WalletStarBlocks);
            })
            .catch(err => {
              console.log('failed call by address', err); // { error: 'url missing in async task 2' }
              res.send(err);
            });
          break;
        default:
          break;
      }
    });
  }

  getBlockByIndex() {
    // TODO: S-17.	Use the URL:http://localhost:8000/block/[HEIGHT]

    this.app.get('/block/:blockheight', (req, res) => {
      // Add your code here
      var blockheight = req.params.blockheight;
      console.log(
        `\n\n*** getBlockByBlockheight req blockheight= ${blockheight} ***`
      );

      let bc = new BlockChainClass.BlockChain();

      bc.getBlock(blockheight)
        .then(b => {
          let block = JSON.parse(b);

          let encodedStory = block.body.star.story;
          console.log('encoded Story', '	', encodedStory);
          let deocdedStory = hex2ascii(encodedStory);

          // TODO: S-18.	The response includes entire star block contents along with the addition of star 	story decoded to ASCII.

          block.body.star.storyDecoded = deocdedStory;

          c(block);
          res.send(block);
        })
        .catch(err => {
          console.log('failed ', err); // { error: 'url missing in async task 2' }
          res.send(err);
        });
    });
  }

  /**
   * Implement a POST Endpoint to add a new Block, url: "/api/block"
   */

  postNewBlock() {
    // TODO: S-8.	Use the Url for the endpoint: http://localhost:8000/block
    let self = this;

    self.app.post('/block', (req, res) => {
      // var blockbody=JSON.parse(req);

      /*
            REQUEST:
            curl -X POST \
            http://localhost:8000/block \
            -H 'Content-Type: application/json' \
            -H 'cache-control: no-cache' \
            -d '{
                "address": "1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                "star": {
                    "dec": "69° 27' 1.2",
                    "ra": "9h 54m 26s",
                    "story": "Found star using https://www.google.com/sky/"
                }
            }'
            */

      // console.log(`\n\n*** postNewBlock \t {BlockData} ***`);
      console.log(req.body);

      if (isEmpty(req.body) && req.body.length == 1) {
        // if Object is empty it return true

        res.send('Wrong entry, no block object found!');
      } else {
        // Object is NOT empty
        console.log('story', '	', req.body.star.story);
        let address = req.body.address;

        // TODO: S-10.	Verify that the "address" that send the Star was validated in the previous steps or error.
        let isAddressInMempool = false;
        if (self.mempool.length == 0) {
          res.send('no addresses in mempool!');
        } else {
          self.mempool.forEach(mem => {
            if (mem.walletAddress == address) {
              isAddressInMempool = true;
              if (mem.validationWindow <= 0) {
                res.send('Expired Address!');
              } else {
                let EncodedStory = Buffer(req.body.star.story).toString('hex');
                req.body.star.story = EncodedStory;

                let star = req.body.star;

                console.log('Encoded story', '	', req.body.star.story);

                if (req.body.star.story != '') {
                  let bc = new BlockChainClass.BlockChain();

                  // TODO: S-9.	The Star object and properties are stored in body block of your Blockchain Dataset.

                  let body = {
                    address: address,
                    star: star
                  };

                  let block = new BlockClass.Block(body);
                  bc.addBlock(block)
                    .then(result => {
                      // console.log('The response after adding should contain that block.js ');

                      // TODO: S-11.	The response will look like
                      let block = JSON.parse(result);
                      let encodedStory = block.body.star.story;
                      console.log('encoded Story', '	', encodedStory);
                      let deocdedStory = hex2ascii(encodedStory);

                      block.body.star.storyDecoded = deocdedStory;
                      console.log(
                        'decoded Story',
                        '	',
                        block.body.star.storyDecoded
                      );

                      res.send(block);
                    })
                    .catch(e => console.error(`.addBlock catch(${e})`));
                } else {
                  res.send('Wrong entry, please enter again');
                }
              }
            }

            if (isAddressInMempool == false) {
              res.send('this address is not in mempool!');
            }
          });
        }
      }
    });
  }

  requestValidation() {
    let self = this;

    // TODO: S-1.	Use the URL for the endpoint: http://localhost:8000/requestValidation

    self.app.post('/requestValidation', (req, res) => {
      // console.log(req.body);

      if (isEmpty(req.body)) {
        res.send('Wrong entry, no data object found!');
      } else {
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

        let request = new RequestClass.Request(req.body.address);
        request.message = `${request.walletAddress}:${
          request.requestTimeStamp
        }:starRegistry`;
        request.validationWindow = 300;

        let result = self.AddRequestValidation(request);

        res.send(result);
      }
    });
  }
  startTime(req) {
    let self = this;

    setTimeout(function() {
      self.startTime(req);
    }, 3 * 1000);
  }
  AddRequestValidation(req) {
    let self = this;

    let isAddressExist = false;
    self.mempool.forEach(mem => {
      if (mem.walletAddress == req.walletAddress) {
        isAddressExist = true;
        req = mem;
      }
    });
    let errMsg = '';
    if (isAddressExist) {
      errMsg = 'Warrnign:	this address exist!';
      console.log(errMsg);
    } else {
      self.mempool.push(req);
    }

    let timeElapse =
      new Date()
        .getTime()
        .toString()
        .slice(0, -3) - req.requestTimeStamp;
    let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;

    let timeStamp = new Date()
      .getTime()
      .toString()
      .slice(0, -3);
    let msg = `length:${
      self.mempool.length
    } |${req.walletAddress.toString().slice(31, 34)}| requestTimeStamp:${
      req.requestTimeStamp
    }:| Now:${timeStamp}| timeLeft:${timeLeft}`;
    console.log(msg);

    // TODO: S-4.	When re-submitting within validation window, window should reduce to expires.
    req.validationWindow = timeLeft;

    // TODO: S-2.	The response should contain: walletAddress, requestTimeStamp, message and validationWindow.

    let result = {
      walletAddress: req.walletAddress,
      requestTimeStamp: req.requestTimeStamp,
      message: req.message,
      validationWindow: req.validationWindow
    };

    return req;
  }

  validate() {
    let self = this;

    // TODO: S-5.	Use the URL for the endpoint: http://localhost:8000/message-signature/validate

    self.app.post('/message-signature/validate', (req, res) => {
      if (isEmpty(req.body)) {
        res.send('Wrong entry, no data object found!');
      } else {
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

        let isFoundInMempool = false;
        let selectedRequest;
        self.mempool.forEach(mem => {
          if (mem.walletAddress == req.body.address) {
            isFoundInMempool = true;
            selectedRequest = mem;
          }
        });
        let isValid;
        let message;
        let address;
        let signature;

        // TODO: S-3.	The request must configure a limited validation window of five minutes.
        // TODO: S-6.	Verify that the time window of 5 minutes didn't expired.

        if (selectedRequest.validationWindow >= 0) {
          // now check the signature
          message = selectedRequest.message;
          address = selectedRequest.walletAddress;
          signature = req.body.signature;
          isValid = bitcoinMessage.verify(message, address, signature);
        }
        // TODO: S-7.	The endpoint response should look like

        var result = {
          registerStar: true,
          status: {
            address: selectedRequest.walletAddress,
            requestTimeStamp: selectedRequest.requestTimeStamp,
            message: selectedRequest.message,
            validationWindow: selectedRequest.validationWindow,
            messageSignature: isValid
          }
        };
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
module.exports = app => {
  return new BlockController(app);
};
