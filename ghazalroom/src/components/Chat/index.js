/* eslint-disable no-lone-blocks */
import React, { useEffect, useState, useRef } from "react";
// import API from "../../utils/API";
import Style from "./chat.css"
// import Moment from "react-moment";
import io from "socket.io-client";
// import { set } from "mongoose";
import openSocket from 'socket.io-client';


function Chat(){



  const socket = io("http://localhost:3001", {autoConnect:false,
  transports: ["websocket", "polling"]
});
// const socket = openSocket ("wss://ladyleonorasgamingroom.herokuapp.com/",{autoConnect:false,

//     transports:["websocket","polling"]
// });
const [instructionDisplayVis, setInstructionDisplayVis]=useState("off");
const [instructionDisplay, setInstructionDisplay]=useState("please wait")
const [refrain, setRefrain]=useState("");
const nameRef = useRef(); 
const firstSentenceOne = useRef();
const firstSentenceTwo = useRef();
const subsequentSentenceOne = useRef();
const subsequentSentenceTwo = useRef();
const roomSelection = useRef();
// const [firstCouplet, setFirstCouplet]=useState("");
// const [SubsequentCouplet, setSubsequentCouplet]=useState(""); 
//referenced mchatwindow
const chatwindowRef = useRef();
//turn interior stuffs on 
const [session, setSession]= useState("off")
//turn the couplets on 
const [firstCoupletInput, setFirstCoupletInput]=useState("off")
const [coupletInputSubsequent, setCoupletInputSubsequent]=useState("off")
 //username
 const [poetName, setPoetName]=useState("");
  const [nameWarningText, setNameWarningText]=useState("");
  const [couplet, setCouplet] = useState("")
//this is used to display the first sentence  
  const [currentdisplay, setCurrentDisplay]=useState("Write your first sentence please")
//the list of users
  const [users, setUsers] = useState([
    {name:"Marcel", id:0}, {name:"Leonora", id:1}, {name:"Max", id:2}, {name:"Andre", id:3},]);
//if the user wants to communicate
    const [message, setMessage] = useState("");
//all the messages goto the message window
    const [messages, setMessages] = useState([]);
// this is the repository of all of the written couplets during the game
  const [allcouplets, setAllCouplets]=useState([])
//this controls the final poem modal
  const [poemModal, setPoemModal]=useState("off")
//this controls the modal for the rules
 const [rules, setRules]=useState("off")
 //chatwindow
 const [chat, setChat]=useState("off")
 //first sentences
 //subsequent sentences
 //shows the current poet working on the poem
 const [currentPlayer, setCurrentPlayer]=useState("")

// this happens automatically and changes when the 
//username changes

//   var chatWindow = reactDOM.

// },[])
  useEffect(() => {

    if(poetName.length>0){
    socket.connect();
    socket.on("connect", function () {
      // console.log("clientsideworks")
      socket.emit("username", poetName);
    });}

    socket.on("rejected",()=>{
      setNameWarningText("poet name already taken")
    })
    //set all the users in the chatroom 
    socket.on("users", (users) => {
      setUsers( users);
    });
    //when receiving messages
    socket.on("message", (message) => {
     //push the message into the messages array
      setMessages((messages) => [...messages, message]);
      // console.log(chatwindowRef.current.scrollTop);
      chatwindowRef.current.scrollTop = chatwindowRef.current.scrollHeight;
      // console.log(chatwindowRef.current.scrollHeight);
      // console.log(chatwindowRef.current.scrollTop)

      
    });


//the first thing the player sees when logging on is 
//to get the current player 
//and the already established list
    socket.on("start", (info)=>{
      console.log("currentplayer")
      console.log(info.currentPlayer)
      setCurrentPlayer(info.currentPlayer)
      setAllCouplets(info.couplets)
      setSession("on"); 
      setTimeout(() => {
        setInstructionDisplayVis("on")
      }, 1500);
      if(info.currentPlayer===poetName){
        setTimeout(() => {
          setFirstCoupletInput("on")

          
        }, 1500);
        
      }
    })
    socket.on("play", (info)=>{
      console.log("currentplayer")
      console.log(info.currentPlayer)
      setCurrentPlayer(info.currentPlayer)
      setAllCouplets(info.couplets)
      setRefrain(info.refrain);
      
        setTimeout(() => {
          setInstructionDisplayVis("on")
        }, 1500);

      setSession("on"); 
      if(info.currentPlayer===poetName){
        setTimeout(() => {
          setCoupletInputSubsequent("on")
          setInstructionDisplayVis("on")

          
        }, 1500);
        
      }
    })
    // socket.on("gameInfo",(info)=>{
    //   console.log("gameinfo")
    //   console.log(info)
    //   setCurrentPlayer(info.currentPlayer);
    //   setAllCouplets(info.couplets); 
    //   console.log(currentPlayer)
    //   setSession("on"); 
    //   setTimeout(() => {
    //     setInstructionDisplayVis("on")
    //     // setFirstCoupletInput("on")
        
    //   }, 1500);
    // })


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

    socket.on("coupletBroadcast", (couplet)=>{
      console.log("couplets")
      console.log(couplet)
      setRefrain(couplet.refrain);
      setAllCouplets((allCouplets) => [...allCouplets, couplet.couplet
      ])
      setCurrentPlayer(couplet.playerTurn)

      if (couplet.playerTurn===poetName){
        setCoupletInputSubsequent("on")
      }
      else{setCoupletInputSubsequent("off")}
    });
    
    //on another player's disconnect, the cient gets the emit, and rids the player
    //from the list
    socket.on("disconnected", id => {
      setUsers((users) => {
        return users.filter((user) => user.id!==id);
      });
    });
  }
  , [poetName]);



 //unrolls the scroll
 const unrollScroll = (event)=>{
    event.preventDefault();
    event.stopPropagation();
    var poetName = nameRef.current.value;
    console.log(poetName);
    setPoetName(poetName);


   
 }
 

  //emits the messageout
  const handleMessageOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    var newMessage = {
      message: message,
      username: poetName,
    };
    // console.log("messageout")
    // console.log(newMessage)
    socket.open();
    socket.emit("send", newMessage);
    //then set the message variable to blank
    setMessage("");
  };



  const submitFirstCouplet = (event) =>{
    event.stopPropagation();
    event.preventDefault();
    var firstSentence = firstSentenceOne.current.value
    var secondSentence = firstSentenceTwo.current.value
    var firstSentenceArray = firstSentence.split(/[\s,]+/)
    var secondSentenceArray = secondSentence.split(/[\s,]+/)
    


    if (firstSentenceArray.length>0&&secondSentenceArray.length>0){
      if(firstSentenceArray[firstSentenceArray.length-1]===secondSentenceArray[secondSentenceArray.length-1]){
        var couplet = []
        couplet.push(firstSentence);
        couplet.push(secondSentence)
        console.log(firstSentenceArray[firstSentenceArray.length-1])
        var tempRefrain=firstSentenceArray[firstSentenceArray.length-1]
        console.log(tempRefrain);
        setRefrain(tempRefrain)
        var coupletInfo = {
          lines:couplet,
          refrain:tempRefrain
        }
        console.log("coupletinfo")
        console.log(coupletInfo);
        socket.open();
        socket.emit("submitFirstCouplet",coupletInfo)
        setFirstCoupletInput("off")



      }
      else{
        console.log("try to match the ending words of both sentences please")
      }
    }
    else{
      console.log("no sentences")
    }

  }
  const submitSubsequentCouplet=(event)=>{
    event.stopPropagation();
    event.preventDefault();
    var lineOne = subsequentSentenceOne.current.value
    var lineTwo = subsequentSentenceTwo.current.value+ " "+ refrain;
    console.log(lineOne + lineTwo)
    var couplet = [lineOne, lineTwo];
    socket.open();
    socket.emit("submitCouplet",couplet)
    setCoupletInputSubsequent("off")

  }
  

  //takes the value from the sentence input and sets it as a variable ready to emit
  const TypeSentence = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    setCouplet(e.target.value);
  }

  //emits the sentence
  const submitSentence = ()=>{
    socket.open();

    // console.log("sending sentence")
    // console.log(sentence)
    socket.emit("sentence",couplet )
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
  <div>{nameWarningText}</div>
  
  <div className="scroll">
    <div className="topScroll">
      <p className={"ghazalTitle "+(session==="on"?"":"invisible")}><h1>Ghazal</h1></p>
    <div className={"nameDiv "+(session==="on"?"invisible":"")}>
      <form className="nameForm" onSubmit={unrollScroll}>
      <p className="nameQuestion">oh poet, what would you like to be called?</p>
      <input ref={nameRef} type = "text" className="nameInputDiv"></input>
      <p className = "roomQuestion"> and which room do you deem fit to enter?</p>
      <select className="roomSelection" >
        <option disabled selected value></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
</select>
      <input type= "submit"className= "nameSubmit"></input>
      </form>
    </div>
    </div>
    <div className={"scrollSheet "+ (session==="on"?"scrollSheet2":"")}>
    <h1 className={"instruction "+(instructionDisplayVis==="on"?"":"invisible")}>{instructionDisplay}</h1>
    <div className={instructionDisplayVis==="on"?"":"invisible"}>
        currebt player: {currentPlayer}
        refrain: {refrain}
      </div>

      <div className={"prevSentences "+(instructionDisplayVis==="on"?"":"invisible")}>
        {!allcouplets.length? (
          <div>all couplets</div>
        ):(
          <div>
            {allcouplets.map((couplet,index)=>(
              <div key={index}className="poem">
              <div key={index +"1"}>{couplet[0]}</div>
              <div key={index + "2"}>{couplet[1]}</div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      <form onSubmit={submitFirstCouplet} className={"coupletInput "+(firstCoupletInput==="on"?"":"invisible")}>
        <div className="firstSentenceInput">
        <input ref={firstSentenceOne} className="lineInput" type="text"></input>

        </div>
        <div className="firstCoupletInput">
        <input ref={firstSentenceTwo}  className="lineInput" type="text"></input>
        </div>
        <input type="submit" value="submit couplet"></input>
        </form >

        <form onSubmit={submitSubsequentCouplet} className={"coupletInput2 "+(coupletInputSubsequent==="on"?"":"invisible")}>
        <div className="subsequentCoupletceInput">
        <input ref={subsequentSentenceOne} className="lineInput" type="text"></input>
        </div>
        <div className="subsequentCoupletceInput">
        <input ref={subsequentSentenceTwo} className="lineInput2" type="text"></input>
        <div className="refrainDiv">{refrain}</div>
        </div>
        <input type="submi  t" value="submit couplet"></input>
      </form>

    </div>
    <div className="bottomScroll">
    
    </div>
     
  </div>



<div className= "chatWindow">
<div className={"sidenavchat "+(session==="on"?"visible ":"invisible ")+(chat==="on"?"largeChat":"")}> 
      <div   className={"chatWindow "+(chat==="on"?"visible":"invisible")}>
          {!messages.length ? (
                <h1 className="chat-title">Speak</h1>
                 ) : (
                 <div  ref= {chatwindowRef} className={"messageBox "+(chat==="on"?"onChatbox":"")}> 
                  {messages.map(({ user, date, text }, index) => (
                    <div
                      key={index}
                    
                      className={user === poetName ? "toLeft" : "toRight"}
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
            <button className={"chatbtn "+(chat==="on"?"":"invisible")} onClick={closeChat}>close chat</button>
            <button className={"chatbtn "+(chat==="on"?"invisible":"")} onClick={openChat}>open chat</button>

            
             <div className="roster ">
               {/* the roster with ghost  */}
              <h3>poets in the room</h3>
                <ul id="users">
               
                {users.map(({ name, id }) => (
                  <li key={id} className={(chat==="on"?"centeredLi":"")}>{name}</li>
                ))}
              </ul>
          </div> 
        </div>
  </div>
</div>


</div> 
 
);
}

export default Chat;
 