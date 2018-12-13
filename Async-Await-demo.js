// this function will return true after 1 second (see the async keyword in front of function)
async function returnTrue() {
  
    // create a new promise inside of the async function
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 1000) // resolve
    });
    
    // wait for the promise to resolve
    let result = await promise;
     
    // console log the result (true)
    console.log(result);
  }
  
  // call the function
  returnTrue();