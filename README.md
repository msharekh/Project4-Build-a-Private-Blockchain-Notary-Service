# Project4-Build-a-Private-Blockchain-Notary-Service


In this project, we build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky. 
This application is build usijng RESTful API, ExpressJS 


## Download project
```
git clone https://github.com/msharekh/Project4-Build-a-Private-Blockchain-Notary-Service.js.git
```



## Installation 

#### Install project dependencies:
```
$ npm install
```
#### REQUIRED LIBRARIES
- npm:            `npm install npm@latest -g`
- express:        `npm install express --save`
- body-parser:    `npm install body-parser --save`
- crypto-js:      `npm install crypto-js --save`
- level:          `npm install level --save`
- bitcoinjs-lib": `npm install bitcoinjs-lib --save`
- bitcoinjs-message": `npm install bitcoinjs-message --save`
- hex2ascii": `npm install hex2ascii --save`
 
 
to start application run this command:
```
node app.js
```


## Usage
 
#### validate request with JSON response:

User makes a request to submit a star and sends address
for example, when "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc" and use the following url:
(http://localhost:8000/requestValidation)
```
curl -X POST \
                http://localhost:8000/requestValidation \
                -H 'Content-Type: application/json' \
                -H 'cache-control: no-cache' \
                -d '{ "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc" }'
the API responds with a message that the user should sign with its private keys:
```
```
{  
   "walletAddress":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
   "requestTimeStamp":"1544766868",
   "message":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc:1544766868:starRegistry",
   "validationWindow":291,
   "mempoolStatus":"Valid"
}
```

#### User signs the message and sends it to the service.
for example, when "signature":"IKQR7cn7bOGcHKM7tjCmLlZfLwDYwWdhNjaI7niyY9KJLmsakZ3l9Egent4+aJt7Nqv6l+9340UWXRHhqqAQ1+U="
and use the following url:
(http://localhost:8000/message-signature/validate)

```
curl -X POST \
            http://localhost:8000/message-signature/validate \
            -H 'Content-Type: application/json' \
            -H 'cache-control: no-cache' \
            -d '{
                "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                "signature":"IKQR7cn7bOGcHKM7tjCmLlZfLwDYwWdhNjaI7niyY9KJLmsakZ3l9Egent4+aJt7Nqv6l+9340UWXRHhqqAQ1+U="
            }'
```

Service checks if signature is valid. Inform the user of the result
```
{  
   "registerStar":true,
   "status":{  
      "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
      "requestTimeStamp":"1544766868",
      "message":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc:1544766868:starRegistry",
      "validationWindow":291,
      "messageSignature":true
   }
}
```
#### If signature is valid, user is able to submit a star.
for example, when "star": {
                        "dec": "69° 27'\'' 1.2",
                        "ra": "9h 54m 26s",
                        "story": "Found star using https://www.google.com/sky/"
                    }
 and use the following url:
(http://localhost:8000/block)
```
curl -X POST \
                http://localhost:8000/block \
                -H 'Content-Type: application/json' \
                -H 'cache-control: no-cache' \
                -d '{
                "address": "1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
                "star": {
                        "dec": "69° 27'\'' 1.2",
                        "ra": "9h 54m 26s",
                        "story": "Found star using https://www.google.com/sky/"
                    }
            	    }'
```
After submitting a star, the same user has to restart all the process to be able to submit another star. 
```
{  
   "hash":"8a7776a2e7e0973c3d8a5b2e4ea7b143243fa2f5e2b1e5a15129dfa0d7b789e1",
   "height":8,
   "body":{  
      "address":"1Kc8NccSW4qieURf2AjikTzs99vq1oBerc",
      "star":{  
         "dec":"69° 27' 1.2",
         "ra":"9h 54m 26s",
         "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
         "storyDecoded":"Found star using https://www.google.com/sky/"
      }
   },
   "time":"1544809720",
   "previousBlockHash":"6bf6374522a1721b150126bc2b7f0a015cdb8ad068cf9cc1c38ab5bb605271da"
}
```









