/* eslint-disable no-lone-blocks */
import React, { useEffect, useState, useRef } from "react";
// import API from "../../utils/API";
import Style from "./chat.css"
// import Moment from "react-moment";
import reactDOM from "react-dom";
import moment from "moment";
import io from "socket.io-client";
// import { set } from "mongoose";
import openSocket from 'socket.io-client';


function Chat(){



//   const socket = io("http://localhost:3001", {autoConnect:false,
//   transports: ["websocket", "polling"]
// });
const socket = openSocket ("wss://ladyleonorasgamingroom.herokuapp.com/",{autoConnect:false,

    transports:["websocket","polling"]
});

//referenced mchatwindow
const chatwindowRef = useRef();
//turn interior stuffs on 
  const [interior, setInterior]= useState("off")
//turn curtains on and off
  const [curtain, setCurtain] = useState ("off")
 //username
  const [userName, setUserName] = useState("");
//set if it's teh client's turn to play
  const [turn, setTurn] = useState("on")
//variable used to test and set username
  const [tempUsername, setTempUsername] = useState ("");
//is username is of the surrealists, then they cannot use it 
  const [nameWarning, setNameWarning] = useState("off")
//this is the sentence used to pass on and play the game
  const [sentence, SetSentence] = useState("")
//this is used to display the first sentence  
  const [currentdisplay, setCurrentDisplay]=useState("Write your first sentence please")
//the list of users
  const [users, setUsers] = useState([
    {name:"Marcel", id:0}, {name:"Leonora", id:1}, {name:"Max", id:2}, {name:"Andre", id:3},]);
//if the user wants to communicate
    const [message, setMessage] = useState("");
//all the messages goto the message window
    const [messages, setMessages] = useState([]);
// this is the repository of all of the written sentences during the game
  const [allsentences, setAllsentences]=useState([])
//this controls the final poem modal
  const [poemModal, setPoemModal]=useState("off")
//this controls the modal for the rules
 const [rules, setRules]=useState("off")
 //chatwindow
 const [chat, setChat]=useState("off")

// this happens automatically and changes when the 
//username changes

//   var chatWindow = reactDOM.

// },[])
  useEffect(() => {
    if(userName.length>0){
    socket.connect();
    socket.on("connect", function () {
      // console.log("clientsideworks")
      socket.emit("username", userName);
    });}
    //set all the users in the chatroom 
    socket.on("users", (users) => {
      setUsers( users);
    });
    //when receiving messages
    socket.on("message", (message) => {
      // console.log(message);
      // var id = message.id
      // console.log(users[id])
      //push the message into the messages array
      setMessages((messages) => [...messages, message]);
      // console.log(chatwindowRef.current.scrollTop);
      chatwindowRef.current.scrollTop = chatwindowRef.current.scrollHeight;
      // console.log(chatwindowRef.current.scrollHeight);
      // console.log(chatwindowRef.current.scrollTop)

      
    });
    // as other players connect to the server, the player's name is pushed into the list of players
    socket.on("connected", (user) => {
      setUsers((users) => [...users, user]);
    });

    //once this client receives the broadcasted sentence
    //the sentence is set as the display
    //sentence.player is the prodcasted next player in line
    //the sentence is also sent to the allsentences variable
    //if this client's username == the prodcasted name, 
    // the turn ariable is turned on and the player can type into the input div

    socket.on("sentenceBroadcast", (sentence)=>{
      // console.log("newsentence")
      // console.log(sentence.text);
      // console.log(sentence.player)
      setCurrentDisplay(sentence.text);
      setAllsentences((allsentences) => [...allsentences, sentence.text
      ])
      if (sentence.player===userName){
        setTurn("on")
      }
      else{setTurn("off")}
    });
    
    //on another player's disconnect, the cient gets the emit, and rids the player
    //from the list
    socket.on("disconnected", id => {
      setUsers((users) => {
        return users.filter((user) => user.id!==id);
      });
    });
  }
  , [userName]);

//on the exterior, sets the username for this session
 const handleNameInputChange = function(e){
   e.preventDefault();
   e.stopPropagation();
   setTempUsername(e.target.value);
   
 }
//opens the curtian and begins the game
 const opencurtain = () =>{
   //the player cannot choose any of the surrelists' names
  if(tempUsername==="Leonora"||tempUsername==="Max"||tempUsername==="Marcel"||tempUsername==="Andre")
  {
  //if so, the thing warns you and then turns off right after
   setNameWarning("on");
   setTimeout(() => {
   setNameWarning("off")
    }, 2000);
  }
  //if the thing has any thing init, the curtain is turned on
  else if(tempUsername.length>0){
    setCurtain("on")
    setUserName(tempUsername)
      // console.log(userName);
  //turns on and connects to socket.io after two seconds
    setTimeout(() => {
      setInterior("on")
      // console.log(userName); 
      // const socket = openSocket("http://localhost:3001", {
      // transports: ["websocket", "polling"]
      //   }); 
       }, 2000);
    }
  }

  //emits the messageout
  const handleMessageOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    var newMessage = {
      message: message,
      username: userName,
    };
    // console.log("messageout")
    // console.log(newMessage)
    socket.open();
    socket.emit("send", newMessage);
    //then set the message variable to blank
    setMessage("");
  };

  //the ghost of surrelists past will speak to you
  const handleMessagetoGhostOut = (event)=>{
    event.preventDefault();
    event.stopPropagation();
    socket.open();

    var newMessage = {
      message: message,
      username: userName,
      };
      // console.log("ghostmessagesent")
      // console.log(newMessage)
      socket.emit("sendToGhost", newMessage);
      //then set the message variable to blank
      setMessage("");
    };

  

  //takes the value from the sentence input and sets it as a variable ready to emit
  const TypeSentence = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    SetSentence(e.target.value);
  }

  //emits the sentence
  const submitSentence = ()=>{
    socket.open();

    // console.log("sending sentence")
    // console.log(sentence)
    socket.emit("sentence",sentence )
  }
  // {"profileImage "+(imageDisplay==="invisible"? 'sleep':'activate' )}
  //opens the modal for the entire poem
  const openPoem = () =>{
    setPoemModal("on")
  }
  const closePoem = () =>{
    setPoemModal("off")
  }
  //opens the modal for the rules modal
  const openRules = ()=>{
    setRules("on")
  }
  const closeRules=()=>{
    setRules("off")
  }

  const openChat =()=>{
    setChat("on")
  }
  const closeChat =()=>{
    setChat("off")
  }
 
return (
//everything
<div className="allContainer">
<div className={"finalPoemModal "+(poemModal==="on"? "":"invisible")}>
    <div className={"finalPoemModalContent "+(poemModal==="on"? "visible":"invisible")}>
      <div className="closeModal" onClick={closePoem}>X</div>
    <ul className="FinalPoemText">
                
                {allsentences.map((sentence, index) => (
                  <li key={index}>{sentence}</li>
                ))}
              </ul>
              <button><a href={"data:text/plain;charset=utf-8, "+ JSON.stringify(allsentences,null,1)} download="poem.txt">download poem</a></button>


    </div>

    
    </div>
    <div className={"rules "+(rules ==="on"? "":"invisible")}>
      <div className={"rulesContent "+(rules ==="on"? "visible":"invisible")}>
        <div className="closeRules" onClick={closeRules}>X</div>
        <p> For a minimum of three players, the first player writes any sentence, question, or statement and shows it to the next player. The second player then must write the exact opposite of the statement, word by word. The first statement is conceiled and passed onto the third player who must negate the negation of the first sentence.</p>
        <p>Here is an example composed by M Sandoz, F R Simon, and M Zimbacca </p>
        <p>
        <br />When my mother swigs champagne.
        <br />My father’s corpse gets drunk on chianti.
        <br />Our mother’s infants dry up tearlessly.
        <br />The moribund waters of my fatherland.
        <br />An infant dessicates our universe.
        <br />An old corpse waters their afterlife.
        <br />Two infants absorb what precedes death
        </p>
    </div>
  </div>
{/* the curtain and the name block */}
  <div className="exterior">
    <div className={"leftCurtain "+( curtain==="on"? "leftcurtainOn":"")}></div>
    <div className={"rightCurtain "+ (curtain==="on"? "rightCurtainOn":"")}></div>
    {/* name input section */}
    <div className={"nameInputDiv "+(curtain==="on"? " invisible":"")}>
        <div className="nameQuestion">
          Welcome dear visitor,
          what would you like to be called?
          </div>
          {/* input it self */}
          <input className="nameinput" type="text" onChange={handleNameInputChange}></input>
          <input type="submit" onClick = {opencurtain}></input>
          {/* the warning div */}
          <div className={"nameWarning "+(nameWarning==="on"? "visible":"invisible")}>Sorry {tempUsername} is already playing</div>

    </div>
  </div>

  {/* this is the room */}
  <div className="interior ">
    <div className={interior==="on"?"leonora":"invisible"}></div>
    <div className={interior==="on"?"marcel":"invisible"}></div>
    <div className={interior==="on"?"max":"invisible"}></div>
    <div className={interior==="on"?"Andre":"invisible"}></div>



 
      <div className={"title "+(interior==="on"?"titleAnimate": "invisible")}>
      <div className={interior==="on"?"titleText":"invisible"}>welcome {userName}</div>
      <div className={interior==="on"?"titleText":"invisible"}><h1>let's play OPPOSITES!</h1></div>
        {/* the game sentence display would go here */}
      </div>
    <div className={"table "+ (interior==="on"? "tableAnimate" : "invisible")}>
    <div className={interior==="on"?"titleText":"invisible"}>
    <div className="display ">{currentdisplay}</div>
    <div className = {turn==="on"? "invisible":""}>please wait your turn</div>
    {/* <div className = {turn==="on"? "":"invisible"}>please enter the opposite sentence</div> */}


      {/* this is the input div for the sentence, will only be visible when turn is on */}
      <input  className = {"sentenceInput "+(turn==="on"?"": "invisible")} onChange={TypeSentence} type="text" placeholder="write your sentence please"></input>
      <button className={"submitbutton "+(turn==="on"?"": "invisible")} onClick={submitSentence}>broadcast Sentence</button>
      {/* this is the button to skip to the next player */}
      <button className="turnButtom gameButton" onClick={submitSentence}>next player</button>
      <button className="openPoemButton gameButton" onClick={openPoem}>see poem</button>
      <button className="openRulesButton gameButton" onClick={openRules}>see Rules</button>

      </div>
    </div>

</div>
    {/* this is the window for chatting with either players or ghosts of the surrealists  */}
    <div className={"sidenavchat "+(interior==="on"?"visible ":"invisible ")+(chat==="on"?"largeChat":"")}> 
      <div   className={"chatWindow "+(chat==="on"?"visible":"invisible")}>
          {!messages.length ? (
                <h1 className="chat-title">Speak</h1>
                 ) : (
                 <div  ref= {chatwindowRef} className={"messageBox "+(chat==="on"?"onChatbox":"")}> 
                  {messages.map(({ user, date, text }, index) => (
                    <div
                      key={index}
                    
                      className={user === userName ? "toLeft" : "toRight"}
                    >
                      {user}: {text}{" "}
                    </div>
                  ))}
                </div>
              )}
            </div>
       <div>
         {/* the window to type in message */}
            <input className={"chatBox "+(chat==="on"?"visible":"invisible")}
              type="text"
              placeholder="message"
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
            />
            <button className={"chatbtn "+(chat==="on"?"":"invisible")} onClick={handleMessageOut}>speak</button>
            <button className={"chatbtn "+(chat==="on"?"":"invisible")} onClick={handleMessageOut} onClick={handleMessagetoGhostOut}>speak with ghost</button>
            <button className={"chatbtn "+(chat==="on"?"":"invisible")} onClick={closeChat}>close chat</button>
            <button className={"chatbtn "+(chat==="on"?"invisible":"")} onClick={openChat}>open chat</button>

            
             <div className="roster ">
               {/* the roster with ghost  */}
              <h3>players in the room</h3>
                <ul id="users">
                <li className={(chat==="on"?"centeredLi":"")}>Leonora</li>
                <li className={(chat==="on"?"centeredLi":"")}>Marcel</li>
                <li className={(chat==="on"?"centeredLi":"")}>Max</li>
                <li className={(chat==="on"?"centeredLi":"")}>Andre</li>
                {users.map(({ name, id }) => (
                  <li key={id} className={(chat==="on"?"centeredLi":"")}>{name}</li>
                ))}
              </ul>
          </div> 
        </div>
  </div>
</div>  
);
}

export default Chat;
 