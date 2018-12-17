/*
    _____  _____  _______      __  _______ ______     ____  _      ____   _____ _  _______ _    _          _____ _   _  
   |  __ \|  __ \|_   _\ \    / /\|__   __|  ____|   |  _ \| |    / __ \ / ____| |/ / ____| |  | |   /\   |_   _| \ | | 
   | |__) | |__) | | |  \ \  / /  \  | |  | |__      | |_) | |   | |  | | |    | ' / |    | |__| |  /  \    | | |  \| | 
   |  ___/|  _  /  | |   \ \/ / /\ \ | |  |  __|     |  _ <| |   | |  | | |    |  <| |    |  __  | / /\ \   | | | . ` | 
   | |    | | \ \ _| |_   \  / ____ \| |  | |____    | |_) | |___| |__| | |____| . \ |____| |  | |/ ____ \ _| |_| |\  | 
   |_|  _ |_|__\_\_____|   \/_/____\_\_|  |______|___|____/|______\____/ \_____|_|\_\_____|_|__|_/_/    \_\_____|_| \_| 
   | \ | |/ __ \__   __|/\   |  __ \ \   / /     / ____|  ____|  __ \ \    / /_   _/ ____|  ____|                       
   |  \| | |  | | | |  /  \  | |__) \ \_/ /     | (___ | |__  | |__) \ \  / /  | || |    | |__                          
   | . ` | |  | | | | / /\ \ |  _  / \   /       \___ \|  __| |  _  / \ \/ /   | || |    |  __|                         
   | |\  | |__| | | |/ ____ \| | \ \  | |        ____) | |____| | \ \  \  /   _| || |____| |____                        
   |_| \_|\____/  |_/_/    \_\_|  \_\ |_|       |_____/|______|_|  \_\  \/   |_____\_____|______|                       
                                                                                                                                                                                                                                                                                                          
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
