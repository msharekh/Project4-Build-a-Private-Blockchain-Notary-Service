const SHA256 = require('crypto-js/sha256');

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
// this.db = level(chainDB);
const BlockClass = require('./Block.js');

function c(txt) {
  console.log(txt);
}

//---------((((((((((((((((((((((((((()))))))))))))))))))))))))))

//--------- Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  db.put(key, value, function(err) {
    if (err) {
      return 'Block ' + key + ' submission failed', err;
      // reject('error in addLevelDBData')
    } else {
      // getLevelDBData(key);
    }
  });
}

//--------- Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise(function(resolve, reject) {
    db.get(key, function(err, value) {
      if (err) return console.log('Not found!', err);
      resolve(value);
    });
  });
}

//--------- Add data to levelDB with value
function addDataToLevelDb(value) {
  let i = 0;
  db.createReadStream()
    .on('data', function(data) {
      i++;
    })
    .on('error', function(err) {
      return console.log('Unable to read data stream!', err);
    })
    .on('close', function() {
      console.log('Block #' + i);
      addLevelDBData(i, value);
    });
}

//--------((((((((((((((((((((((((((()))))))))))))))))))))))))))

/* ===== BlockChain Class ===================================
|  Class with a constructor for BlockChain       |
|  ====================================================*/
class BlockChain {
  constructor() {
    this.chain = [];

    this.getBlockHeight().then(h => {
      if (h == 0) {
        this.addBlock(new BlockClass.Block('First block in the chain  '));
      }
    });
  }

  /*################################################
    ################ Add block  ######################
    ################################################*/
  addBlock(newBlock) {
    let self = this;
    return new Promise(function(resolve, reject) {
      // let h = 0;

      self.getBlockHeight().then(h => {
        /// Block height
        newBlock.height = h;

        //*************** formating block *****************
        /*    objBlock:-
          -   objBlock[0]...........newBlock
          -   objBlock[1]...........h
          -   objBlock[2]...........previousBlock
          */

        newBlock.time = new Date()
          .getTime()
          .toString()
          .slice(0, -3);

        if (h > 0) {
          // previous block hash
          self
            .getBlock(h - 1)
            .then(previousBlock => {
              newBlock.previousBlockHash = JSON.parse(previousBlock).hash;
              // Block height
              newBlock.height = h;

              //check existance of newBlock

              // Block hash with SHA256 using newBlock and converting to a string
              newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
              //finally VERY IMPORTANT - stringify block

              newBlock = JSON.stringify(newBlock).toString();

              // Adding block object to chain
              //*************** adding block to DB *****************
              addLevelDBData(h, newBlock);
              resolve(newBlock);
            })
            .catch(e => console.error(`.catch(${e})`));
        } else {
          newBlock.body =
            newBlock.body.toString() + ' ***** GENESIS Block *****';

          // Block hash with SHA256 using newBlock and converting to a string
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

          //finally VERY IMPORTANT - stringify block
          newBlock = JSON.stringify(newBlock).toString();
          c(newBlock);
          // Adding block object to chain
          //*************** adding block to DB *****************
          addLevelDBData(0, newBlock);
          resolve(newBlock);
        }
        // resolve('saved')

        // })
      });
    }).catch(e => console.error(`.catch(${e})`));
  }

  /*################################################
    ################ Get block height ################
    ################################################*/
  getBlockHeight() {
    let self = this;
    return new Promise(function(resolve, reject) {
      let h = 0;
      let result = 0;
      db.createReadStream()
        .on('data', function(data) {
          h++;
        })
        .on('error', function(err) {
          console.log('Unable to read data stream!', err);
          result = 0;
        })
        .on('close', function() {
          // console.log('p BlockHeight\t' + h);
          resolve(h);
        });
      // (result)
    });
  }

  /*################################################
    ################ Get block  ######################
    ################################################*/
  getBlock(blockHeight) {
    // return object as a single string

    return new Promise(function(resolve, reject) {
      db.get(blockHeight, function(err, block) {
        if (err) {
          reject(`Block Height : ${blockHeight} is Not found!`, err);
        } else {
          resolve(block);
        }
      });
    });
  }

  getBlockByHash(hash) {
    let block = null;
    return new Promise(function(resolve, reject) {
      db.createReadStream()
        .on('data', function(data) {
          console.log(data.key, '=', data.value);

          if (JSON.parse(data.value).hash === hash) {
            block = data.value;
          }
        })
        .on('error', function(err) {
          console.log('Oh my!', err);

          reject(err);
        })
        .on('close', function() {
          console.log('Stream closed');

          resolve(block);
        })
        .on('end', function() {
          console.log('Stream ended');
        });
    });
  }

  getBlockByWalletAddress(address) {
    // TODO: S-16.	response contained a list of Stars of one wallet address for multiple Stars.
    let blocks = [];
    return new Promise(function(resolve, reject) {
      db.createReadStream()
        .on('data', function(data) {
          console.log(data.key, '=', data.value);
          if (JSON.parse(data.value).body.address === address) {
            blocks.push(data.value);
          }
        })
        .on('error', function(err) {
          console.log('Oh my!', err);

          reject(err);
        })
        .on('close', function() {
          console.log('Stream closed');

          resolve(blocks);
        })
        .on('end', function() {
          console.log('Stream ended');
        });
    });
  }
  /*################################################
    ################ validate block  #################
    ################################################*/
  validateBlock(blockHeight) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let result;
      // get block chain
      //let bc = new BlockChain();

      // get block object

      self
        .getBlock(blockHeight)
        .then(b => {
          // let block=JSON.parse(block);
          let block = JSON.parse(b);
          // get block hash
          let blockHash = block.hash;

          // remove block hash to test block integrity
          block.hash = '';

          // generate block hash
          let validBlockHash = SHA256(JSON.stringify(block)).toString();

          // Compare
          if (blockHash === validBlockHash) {
            // c('*** Matched ***')
            // c('Block #'+blockHeight+'  hash:\n'+blockHash+' === '+validBlockHash);

            result = true;
          } else {
            console.log(
              'Block #' +
                blockHeight +
                ' invalid hash:\n' +
                blockHash +
                '<>' +
                validBlockHash
            );
            result = false;
          }
          resolve(result);
        })
        .catch(e => console.error(`.catch(${e})`));
      // c(r);
    });
  }

  /*################################################
    ################ validate Chain  #################
    ################################################*/
  validateChain() {
    let self = this;

    let errorLog = [];
    // let bc = new BlockChain();

    //get blockHieght
    self
      .getBlockHeight()
      .then(h => {
        let result;

        (function theLoop(i) {
          setTimeout(function() {
            //validate blocks
            c(i);
            // let i=0
            var promise_validateBlock = self.validateBlock(i).then(result => {
              let isValidateBlock = result;
              c(i + ' isValidateBlock\t' + result);

              return result;
            });

            var promise_getBlock = self
              .getBlock(i)
              .then(b => {
                let block = JSON.parse(b);
                let blockHash = block.hash;
                // c('blockHash\t'+blockHash)

                return blockHash;
              })
              .catch(function(error) {
                console.log('error' + error);
              });

            var promise_getNextBlock = self
              .getBlock(i + 1)
              .then(b => {
                let nextblock = JSON.parse(b);

                let previousHash = nextblock.previousBlockHash;
                // c('previousHash\t'+previousHash)

                return previousHash;
              })
              .catch(function(error) {
                console.log('error' + error);
              });

            Promise.all([
              promise_validateBlock,
              promise_getBlock,
              promise_getNextBlock
            ])
              .then(values => {
                console.log('\nPromise.all\n');

                let isValidateBlock = values[0];
                c('isValidateBlock\t' + isValidateBlock);
                let blockHash = values[1];
                c('blockHash\t' + blockHash);
                let previousHash = values[2];
                c('previousHash\t' + previousHash);
                c('ticking..\t' + i);

                if (blockHash !== previousHash) {
                  errorLog.push(i);
                }

                i++;
                if (i < h - 1) {
                  theLoop(i);
                } else {
                  console.log('no more blocks to check');

                  if (errorLog.length > 0) {
                    console.log('Block errors = ' + errorLog.length);
                    console.log('Blocks: ' + errorLog);
                  } else {
                    console.log('No errors detected');
                  }
                }
              })
              .catch(function(error) {
                console.log('all errors' + error);
              });
          }, 2000);
        })(0);
      })
      .catch(e => console.error(`.catch(${e})`));

    // })
  }

  showBlockChain() {
    return new Promise(function(resolve, reject) {
      let i = 0;
      // for ( n=0 ; n<h ; n++ ){

      // }
      let blocks = [];
      db.createReadStream()
        .on('data', function(data) {
          i++;
          blocks.push(data);
        })
        .on('error', function(err) {
          return console.log('Unable to read data stream!', err);
        })
        .on('close', function() {
          resolve(blocks);
        });
    });
  }
} //<-------end BlockChain

module.exports.BlockChain = BlockChain;
