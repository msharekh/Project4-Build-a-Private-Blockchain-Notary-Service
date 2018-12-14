
/* ===== Wallet Class ==============================
|  Class with a constructor for Wallet 			   |
|  ===============================================*/

class Request {
    constructor(address){
        this.walletAddress = address,
        this.requestTimeStamp = new Date().getTime().toString().slice(0,-3),
        this.message = "",
        this.validationWindow = 0
        this.status=""
    }
}


module.exports.Request = Request;