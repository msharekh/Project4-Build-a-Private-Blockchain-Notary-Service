//Importing Express.js module
const express = require("express");//--------> this.app = express();
//Importing BodyParser.js module
const bodyParser = require("body-parser");
 
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
		this.app.set("port", 8000);
	}

    /**
     * Initialization of the middleware modules
     */
	initExpressMiddleWare() {
		this.app.use(bodyParser.urlencoded({extended:true}));
		this.app.use(bodyParser.json());
	}

    /**
     * Initilization of all the controllers
     */
	initControllers() {
		// debugger
		require("./BlockController.js")(this.app);
	}

    /**
     * Starting the REST Api application
     */
	start() {
		let self = this;

		let bc = new BlockChainClass.BlockChain();

		this.app.listen(this.app.get("port"), () => {
			console.log(`Server Listening for port: ${self.app.get("port")}`);
		});

		this.app.get('/', function(req, res){
			console.log('visiting /');
		});
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