
const express = require('express');
// const quotes = require("./utility/quotes")
const path = require("path");
const { Socket } = require('socket.io-client');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server, {
  transports: ["websocket", "polling"]
})



// app.use(express.static("leonorasgamingtable/build"));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname,  "leonorasgamingtable/build", "index.html"));
// });
const PORT = process.env.PORT || 3001 ;
// players with custom IDs
  var users ={}  
  var usernames=[]
//   all of the players names in an array
  //player's turn
  var i= 0;
  //all of the sentences
  var couplets = [["sdsdsdS", "dsdsdsdsdsdsds"] ];
  var currentPlayer="";
  var refrain =""




  io.on("connection", client => {
//    
    //the client is to receive a username
  client.on("username", username => {
    // console.log("username received")
    console.log(username);
    user = {
      name: username,
      id: client.id
    };
    if (usernames.indexOf(username)!==-1){
      console.log("useralreadyexists")
      client.emit("rejected")
      client.disconnect();
    }
    else{
      usernames.push(username)
    users[client.id] = user;
    client.broadcast.emit("connected", user);
    io.emit("users", Object.values(users));
    var players = Object.values(users)
    if(players.length<2&&refrain.length<1){
        i=0
        console.log("userslist")
        console.log(users)
        console.log(players)
        console.log(i)
        currentPlayer=players[i].name
        console.log(currentPlayer)
        console.log("start")
      client.emit("start", 
      {currentPlayer:currentPlayer,
      couplets:couplets}
      )
     }
    else{
      console.log("userslist2")
      console.log(users)
      var players = Object.values(users)
      console.log(players)
      console.log(i)
      currentPlayer=players[i].name
      console.log("play")
    client.emit("play",{
      currentPlayer:players[i].name,
      couplets:couplets,
      refrain:refrain})
  

    
  }
}});
  //when a player emit a sentence, it is received here and is broadcasted to others
  client.on("sentence", sentence=>{
      // console.log("received sentence")
      // console.log(sentence)
      // console.log(i)
    sentences.push(sentence);
    var players = Object.values(users)
    currentPlayer=players[i].name

    //broadcasted to otheres and also emit the next player in line to others
    io.emit("sentenceBroadcast",{
      text:sentence,
      player:players[i].name,
      refrain:refrain
    })
    // console.log("server emitted sentencec")
    i++
    if(i>players.length-1){
        i=0
    }
})

client.on("submitFirstCouplet", (coupletInfo)=>{
  couplets.push(coupletInfo.lines)
  var players = Object.values(users)
  refrain=coupletInfo.refrain
  console.log(i);
  console.log(players)
  console.log(refrain)
    currentPlayer=players[i].name
    io.emit("coupletBroadcast",{
      couplet:coupletInfo.lines,
      playerTurn:currentPlayer,
      refrain:refrain
    })
  i++
  if(i>players.length-1){
      i=0
  }
})
client.on("submitCouplet", (couplet)=>{
  var players = Object.values(users)
 
  couplets.push(couplet)
  currentPlayer=players[i].name

  io.emit("coupletBroadcast",{ 
    couplet:couplet,
  playerTurn:currentPlayer,
refrain:refrain 
 })
  i++
  if(i>players.length-1){
      i=0
  }
})

//the server receives the message
  client.on("send", message => {
      // console.log(message)
    //server emit the message to other players
    io.emit("message", {
      text: message.message,
      date: new Date().toISOString(),
      user: message.username
    });
  });

  client.on("disconnect", () => {
    var username = users[client.id];
    // username = username.username;
    // console.log("loggedout")
    // console.log(username)
    delete users[client.id];

    io.emit("disconnected", client.id);
    if (username =  currentPlayer){

    }
  });

client.on("sendToGhost", (message)=>{
  // console.log("ghost received")
  // console.log(message);
  io.emit
  io.emit("message", {
    text: message.message,
    date: new Date().toISOString(),
    user: message.username
    
  });
  setTimeout(() => {
  var quoteLength = quotes.length-1;
  var randomNumber = Math.floor(Math.random() * quoteLength)
  var ghostMessage = quotes[randomNumber]
  io.emit("message",{
    text:ghostMessage.quote,
    date: new Date().toISOString(),
    user:ghostMessage.name

  })
    
  }, 100);
  
  
})
});

// users.filter((user) => user.id!==id);
  

server.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
  
  });