var randomNumber1 = Math.floor((Math.random(456)*6)+1);

document.getElementsByClassName("img1")[0].setAttribute("src", "./images/dice" + randomNumber1 +".png");

var randomNumber2 = Math.floor((Math.random()*6)+1);
document.getElementsByClassName("img2")[0].setAttribute("src", "./images/dice" + randomNumber2 +".png");

if (randomNumber1 > randomNumber2){
    document.querySelector("h1").textContent = "Player 1 Wins!";
}
if (randomNumber1 == randomNumber2){
    document.querySelector("h1").textContent = "Draw!!";
}
if (randomNumber1 < randomNumber2){
    document.querySelector("h1").textContent = "Player 2 Wins!";
}


var request = require('request');
var requestOptions = {
    'url': 'https://api.tiingo.com/tiingo/daily/aapl/prices?startDate=2019-01-02&token=Not logged-in or registered. Please login or register to see your API Token',
    'headers': {
        'Content-Type': 'application/json'
        }
};

request(requestOptions,
    function(error, response, body) {
        console.log(body);
    }
);        
    

   


