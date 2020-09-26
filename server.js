
const express = require('express');
// const quotes = require("./utility/quotes")
const path = require("path");
const { Socket } = require('socket.io-client');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server, {
  transports: ["websocket", "polling"]
})



app.use(express.static("ghazalroom/build"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname,  "ghazalroom/build", "index.html"));
});
const PORT = process.env.PORT || 3001 ;
// players with custom IDs
  var users ={}  
  //all of the users in the room
  var usernames={
    1:[],
    2:[],
    3:[],
    4:[] 
  }
//   all of the players names in an array
  //player's turn
  var i= {
    1:0,
    2:0,
    3:0,
    4:0
    };
//all of the couplets  
var couplets = {
  1:[["", ""]],
  2:[["",""]], 
  3:[["",""]],
  4:[["", ""]]
};
  var currentPlayer={
    1:"",
    2:"",
    3:"",
    4:""
  };
  var refrain ={
    1:"",
    2:"",
    3:"",
    4:""
}
  var subsequent ={
    1:"off",
    2:"off",
    3:"off",
    4:"off"

  }

  const nextPlayer = function(room,players){
    console.log("nextplayer2")
  
    console.log(room)

    console.log("curret i")
    console.log(i[room])

    i[room]++
    console.log("next i")
    console.log(i[room])

   if (i[room]>players.length-1){
    i[room]=0
    console.log("i = 0 now")  
  }
    if(players[i[room]]){
      currentPlayer[room] = players[i[room]].name
      console.log("currentplayer")
      console.log(currentPlayer[room]);
      if(subsequent[room]==="on"){
        console.log("emitting subseq")
      io.to(room).emit("nextPlayer",currentPlayer[room])
      i[room]++
      if(i[room]>players.length-1){
          i[room]=0
      }    
    } 
      else{
        console.log("emittingfirst")
        io.to(room).emit("nextPlayerFirst",currentPlayer[room])
        i[room]++
        if(i[room]>players.length-1){
        i[room]=0
  }
      }
  }
}

  
 const playerError = function(client,room){ 
 client.emit("playerError")
 console.log("playerserror")
 console.log();
 nextPlayer(room);
}

const getRoom = (id)=>{
  console.log("gettingroom")
  console.log(id)
  console.log(users)
  var user = users[id]
  console.log("user")
  console.log(user);
  var room = user.room;
  return room
}



  io.on("connection", client => {
//    
    //the client is to receive a username
  client.on("username", username => {
    // console.log("username received")
    console.log(username);
    user = {
      name: username.name,
      id: client.id,
      room: username.room
    };
    var room = username.room
    var roomRefrain = refrain[username.room]
    if (usernames[room].indexOf(username.name)!==-1){
      console.log("useralreadyexists")
      client.emit("rejected")
      client.disconnect();
    }
    else{
      usernames[room].push(username.name)
      client.join(username.room)
    users[client.id] = user;
    client.broadcast.to(room).emit("connected", user);
    var players = Object.values(users)
    players = players.filter((player)=>player.room===room)
    io.to(room).emit("users", players);
    
    if(players.length<2&&roomRefrain.length<1){
        i[room]=0
        console.log("userslist")
        console.log(room)
        console.log(users)
        console.log(players)
        console.log(i[room])
        console.log(players)
        if(players[i[room]]){
        currentPlayer[room]=players[i[room]].name
        console.log(currentPlayer)
        console.log("start")
      client.emit("start", 
      {currentPlayer:currentPlayer[room],
      couplets:couplets[room]}
      
      )
    
     
    
    }
      else{
        playerError(client,room)
      }
     }
    else{
      
      console.log("userslist2")
      console.log(users)
      var players = Object.values(users)
      players = players.filter((player)=>player.room===room)

      console.log(players)
      console.log(i[room])
      if(players[i[room]]){
      currentPlayer[room]=players[i[room]].name
      console.log("play")
    client.emit("play",{
      currentPlayer:currentPlayer[room],
      couplets:couplets[room],
      refrain:refrain[room]})}
      else{
        playerError(client,room);
      } 
    }
}});


client.on("submitFirstCouplet", (coupletInfo)=>{
  var room = coupletInfo.room
  console.log(room)
  subsequent[room]="on";
  couplets[room].push(coupletInfo.lines)
  var players = Object.values(users)
  players = players.filter((player)=>player.room===room)

  refrain[room]=coupletInfo.refrain
  console.log(i[room]);
  console.log(players)
  console.log(refrain[room])
  i[room]++;
  if(i[room]>players.length-1){
    i[room]=0;
  }
  if(players[i[room]]){
    currentPlayer[room]=players[i[room]].name
    console.log(players[i[room]])
    console.log("currentplayer")
    console.log(room)
    console.log(currentPlayer);
    console.log(currentPlayer[room])
    io.to(room).emit("coupletBroadcast",{
      couplet:coupletInfo.lines,
      playerTurn:currentPlayer[room],
      refrain:refrain[room]
    })
  i[room]++
  if(i[room]>players.length-1){
      i[room]=0
  }
}
else{playerError(client,room);
  }

})
client.on("submitCouplet", (couplet)=>{
  var room = couplet.room
  var players = Object.values(users)
  players = players.filter((player)=>player.room===room)

 
  couplets[room].push(couplet.couplet)
  if(players[i[room]]){
  currentPlayer[room]=players[i[room]].name
  io.to(room).emit("coupletBroadcast",{ 
  couplet:couplet.couplet,
  playerTurn:currentPlayer[room],
  refrain:refrain[room] 
 })
  i[room]++
  if(i[room]>players.length-1){
      i[room]= 0
    }
  }
  else{
    playerError(client,room);
  }

})

//the server receives the message
  client.on("send", message => {
    var room = message.room

      // console.log(message)
    //server emit the message to other players
    io.to(room).emit("message", {
      text: message.message,
      date: new Date().toISOString(),
      user: message.username
    });
  });

  client.on("disconnect", () => {
    if (users[client.id]!==undefined){

    var closedUser = users[client.id];
    console.log("closeduser")
    console.log(closedUser)
    var room = getRoom(client.id)
    console.log("cliemt")
  
    // console.log(client)
    console.log("room")
    console.log(room)
    console.log("client.id......")
    console.log(client.id)
    console.log("users.....")

    console.log(users)
    console.log("closed user.....")
   
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
  players = players.filter((player)=>player.room===room)

  if(players.indexOf(currentPlayer[room])==-1){
    console.log("currentplayer is not here")
    var players = Object.values(users)
    console.log(players)
    players = players.filter((player)=>player.room===room)
    console.log(players);
    
    nextPlayer(room,players);
  }
}
else{
  console.log("useridnot founr, plan b")
  delete users[client.id];

  var players = Object.values(users)
  
  for(var j=1;j<5;j++){
    if (currentPlayer[j].length>1&&usernames[j].indexOf(currentPlayer[j])==-1){
      console.log("usernames")
      console.log(usernames[j])
      console.log("currentplayer")
      console.log(currentPlayer[j])
      console.log("nextplayer")
      console.log(j)
      var players = Object.values(users)
      console.log(players)
      players = players.filter((player)=>player.room===room)
      console.log(players);
      nextPlayer(j,players)
    }
  }

}

    io.to(room).emit("disconnected", client.id);

  });


});

// users.filter((user) => user.id!==id);
  

server.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
  
  });