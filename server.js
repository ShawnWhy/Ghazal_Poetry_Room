
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
  var subsequent = "off"

  const nextPlayer = function(){
    console.log("nextplayer2")
    var players = Object.values(users)
    console.log(players);

    console.log("curret i")
    console.log(i)

    i++
    console.log("next i")
    console.log(i)

   if (i>players.length-1){
    i=0
    console.log("i = 0 now")  
  }
    if(players[i]){
      currentPlayer = players[i].name
      console.log("currentplayer")
      console.log(currentPlayer);
      if(subsequent==="on"){
        console.log("emitting subseq")
      io.emit("nextPlayer",currentPlayer)}
      else{
        console.log("emittingfirst")
        io.emit("nextPlayerFirst",currentPlayer)
      }
  }
}

  
 const playerError = function(){ client.emit("playerError")
 console.log("playerserror")
 console.log();
 nextPlayer();
}




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
        if(players[i]){
        currentPlayer=players[i].name
        console.log(currentPlayer)
        console.log("start")
      client.emit("start", 
      {currentPlayer:currentPlayer,
      couplets:couplets}
      
      )
    
     
    
    }
      else{
        playerError()
      }
     }
    else{
      console.log("userslist2")
      console.log(users)
      var players = Object.values(users)
      console.log(players)
      console.log(i)
      if(players[i]){
      currentPlayer=players[i].name
      console.log("play")
    client.emit("play",{
      currentPlayer:players[i].name,
      couplets:couplets,
      refrain:refrain})}
      else{
        playerError();
      } 
    }
}});


client.on("submitFirstCouplet", (coupletInfo)=>{
  subsequent="on";
  couplets.push(coupletInfo.lines)
  var players = Object.values(users)
  refrain=coupletInfo.refrain
  console.log(i);
  console.log(players)
  console.log(refrain)
  i++;
  if(i>players.length-1){
    i=0;
  }
  if(players[i]){
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
}
else{playerError();
  }

})
client.on("submitCouplet", (couplet)=>{
  var players = Object.values(users)
 
  couplets.push(couplet)
  if(players[i]){
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
  }
  else{
    playerError();
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

    var closedUser = users[client.id];
    console.log("cliemt")
    console.log(client);
    console.log("client.id......")
    console.log(client.id)
    console.log("users.....")

    console.log(users)
    console.log("closed user.....")
    console.log(closedUser)
    console.log(currentPlayer)
  // if (closedUser.name === currentPlayer){
  //   delete users[client.id];
  // console.log("nextplayer")
  //  nextPlayer();
  // }
  // else{
  // delete users[client.id];}
  delete users[client.id];

  console.log("users..........")
  console.log(users)
  var players = Object.values(users)

  if(currentPlayer.indexOf(users)==-1){
    console.log("currentplayer is not here")
    nextPlayer();
  }

    io.emit("disconnected", client.id);

  });


});

// users.filter((user) => user.id!==id);
  

server.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
  
  });