/*
  ____   _               _          _             _                                        
 |  _ \ | |             | |        | |           (_)                                       
 | |_) || |  ___    ___ | | __ ___ | |__    __ _  _  _ __                                  
 |  _ < | | / _ \  / __|| |/ // __|| '_ \  / _` || || '_ \                                 
 | |_) || || (_) || (__ |   <| (__ | | | || (_| || || | | |                                
 |____/ |_| \___/  \___||_|\_\\___||_| |_| \__,_||_||_| |_|                                                                                                                   
                                                                                                                                                                                     
*/

//Importing Express.js module
const express = require('express'); //--------> this.app = express();
//Importing BodyParser.js module
const bodyParser = require('body-parser');

const BlockChainClass = require('./BlockChain.js');

/**
 * Class Definition for the REST API
 */
class BlockAPI {
  /**
   * Constructor that allows initialize the class
   */
  constructor() {
    this.app = express();
    this.initExpress();
    this.initExpressMiddleWare();
    this.initControllers();
    this.start();
  }

  /**
   * Initilization of the Express framework
   */
  initExpress() {
    this.app.set('port', 8000);
  }

  /**
   * Initialization of the middleware modules
   */
  initExpressMiddleWare() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  /**
   * Initilization of all the controllers
   */
  initControllers() {
    // debugger
    require('./BlockController.js')(this.app);
  }

  /**
   * Starting the REST Api application
   */
  start() {
    let self = this;

    let bc = new BlockChainClass.BlockChain();

    this.app.listen(this.app.get('port'), () => {
      console.log(`Server Listening for port: ${self.app.get('port')}`);
    });

    this.app.get('/', function(req, res) {
      console.log('visiting /');
    });

    // let timeElapse = (new Date().getTime().toString().slice(0,-3)) - 1544750580;
    // let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
    // let validationWindow = timeLeft;

    // self.timeoutRequests[request.walletAddress]=setTimeout(function(){
    // 	console.log('timeOutReq=',validationWindow);
    // 	// self.removeValidationRequest(request.walletAddress)
    // }, TimeoutRequestsWindowTime );

    // bc.getBlock(0).then((b) => {
    // 	// c(JSON.parse(b))
    // 	// res.send(JSON.parse(b));

    // }).catch(err => {
    // 	console.log('failed start', err); // { error: 'url missing in async task 2' }
    // 	res.send(err);
    // });
  }
}

new BlockAPI();
