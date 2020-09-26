/* eslint-disable no-lone-blocks */
import React, { useEffect, useState, useRef } from "react";
// import API from "../../utils/API";
import Style from "./chat.css"
// import Moment from "react-moment";
import io from "socket.io-client";
// import { set } from "mongoose";
import openSocket from 'socket.io-client';


function Chat(){



  // const socket = io("http://localhost:3001", {autoConnect:false,
  // transports: ["websocket", "polling"]
// });
const socket = openSocket ("wss://ghazalpoetryroom.herokuapp.com/",{autoConnect:false,

    transports:["websocket","polling"]
});
//variable for chatroom
const [chatRoom, setChatRoom]=useState();
//turn on the instruction display
const [instructionDisplayVis, setInstructionDisplayVis]=useState("off");
//sets the text for current instruction
const [instructionDisplay, setInstructionDisplay]=useState("please wait")
//the text for the refrain
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
 //this controls the modal for the rules
 const [rules, setRules]=useState("off")
 //chatwindow
 const [chat, setChat]=useState("off")
 //first sentences
 //subsequent sentences
 //shows the current poet working on the poem
 const [currentPlayer, setCurrentPlayer]=useState("")
 //player display
 const [playerDisplay, setPlayerDisplay]=useState("off");
 //room display
 const [roomDisplay, setRoomDisplay]= useState("off")
 //current player
 const [CurrentPlayerDisplay, setCurrentPlayerDisplay]=useState("off")
  
 const poemHeight = useRef();

  useEffect(() => {

    if(poetName.length>0){
    socket.connect();
    socket.on("connect", function () {
      // console.log("clientsideworks")
      socket.emit("username", {
        name:poetName,
        room:chatRoom
      });
    });}

    socket.on("rejected",()=>{
      setNameWarningText("poet name already taken")
      setTimeout(() => {
        setNameWarningText("")
        
      }, 1000);
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
        setPlayerDisplay("on")
      }, 1500);
      setTimeout(()=>{
        setPlayerDisplay("on")
      },1600)
      setTimeout(()=>{
        setCurrentPlayerDisplay("on")
      }
      ,1800)
      setTimeout(()=>{
        setRoomDisplay("on")
      }
      ,2000)
      
      if(info.currentPlayer===poetName){
        setTimeout(() => {
          setFirstCoupletInput("on")
          setInstructionDisplay("please write the first stanza")

          
        }, 1500);
        
      }
    })
    socket.on("nextPlayer",(currentPlayer)=>{
      if(poetName===currentPlayer){
        setCoupletInputSubsequent("on")
        setCurrentPlayer(currentPlayer);
      }
    
    })
    socket.on("nextPlayerFirst",(currentPlayer)=>{
      if(poetName===currentPlayer){
        setFirstCoupletInput("on")
        setCurrentPlayer(currentPlayer);

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
       
        setTimeout(()=>{
          setPlayerDisplay("on")
        }
        ,1600)
        setTimeout(()=>{
          setCurrentPlayerDisplay("on")
        }
        ,1800)
        setTimeout(()=>{
          setRoomDisplay("on")
        }
        ,2000)

      setSession("on"); 
      if(info.currentPlayer===poetName){
        setTimeout(() => {
          setCoupletInputSubsequent("on")
          setInstructionDisplayVis("on")
          setInstructionDisplay("please proceed to write the next stanza")
        }, 1500);
        
      }
      else{
        setInstructionDisplay("please wait")
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
      poemHeight.current.scrollTop = poemHeight.current.scrollHeight;

      setCurrentPlayer(couplet.playerTurn)

      if (couplet.playerTurn===poetName){
        setCoupletInputSubsequent("on")
        setInstructionDisplay("please proceed to write the next stanza")
      }
      else{setCoupletInputSubsequent("off")
      setInstructionDisplay("please wait")

        
    }
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
    var roomNumber = roomSelection.current.value
    console.log(roomNumber); 
    console.log(poetName);
    if(poetName.length>0&&roomNumber.length>0){
    setPoetName(poetName);
    setChatRoom(roomNumber)
  }
  else{
    setNameWarningText("please enter both name and room number")
    setTimeout(() => {
      setNameWarningText("")
    }, 2000);
  }
}
 

  //emits the messageout
  const handleMessageOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    var newMessage = {
      message: message,
      username: poetName,
      room:chatRoom
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
    console.log(firstSentenceArray);
    console.log(secondSentenceArray)
    


    if (firstSentence.length>0&&secondSentence.length>0){
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
          refrain:tempRefrain,
          room:chatRoom
        }
        console.log("coupletinfo")
        console.log(coupletInfo);
        socket.open();
        socket.emit("submitFirstCouplet",coupletInfo)
        setFirstCoupletInput("off")
      }
      else{
        setInstructionDisplay("try to match the ending words of both sentences please")
        setTimeout(() => {
          setInstructionDisplay("please write the first stanza")
        }, 1500);
      }
    }
    else{
      setInstructionDisplay("please write both lines")
      setTimeout(() => {
        setInstructionDisplay("please write the first stanza")
      }, 1500);
    }

  }
  const submitSubsequentCouplet=(event)=>{
    event.stopPropagation();
    event.preventDefault();
    console.log("submitsubseq")
    var lineOne = subsequentSentenceOne.current.value
    var lineTwo = subsequentSentenceTwo.current.value+ " "+ refrain;
    if(subsequentSentenceOne.current.value.length>0&&subsequentSentenceTwo.current.value.length>0){
    console.log(lineOne + lineTwo)
    var couplet = [lineOne, lineTwo];
    socket.open();
    socket.emit("submitCouplet",{
    couplet:couplet,
    room:chatRoom})
    setCoupletInputSubsequent("off")
    }
    else{
      setInstructionDisplay("please write both lines")
      setTimeout(() => {
        setInstructionDisplay("please proceede to write the next stanza")
        
      }, 1500);
    }

  }
  




  // {"profileImage "+(imageDisplay==="invisible"? 'sleep':'activate' )}
  //opens the modal for the entire poem

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
  <div className={"rulesModal "+(rules==="on"?"":"invisible")}>
    <div className="closeRules" onClick={closeRules}>x</div>
    <div className="rulesContent">
    A traditional Ghazal consists of five to fifteen couplets, 
    typically seven. A refrain (a repeated word or phrase) appears 
    at the end of both lines of the first couplet and at the end of
     the second line in each succeeding couplet. One or more words 
       before the refrain are rhymes or partial rhymes.
    </div>

  </div>
  <div>{nameWarningText}</div>
  
  <div className="scroll">
    <div className="topScroll">
      <div className={"ghazalTitle "+(session==="on"?"":"invisible")}><h1>Ghazal</h1></div>
    <div className={"nameDiv "+(session==="on"?"invisible":"")}>
      <form className="nameForm" onSubmit={unrollScroll}>
      <p className="nameQuestion">oh poet, what would you like to be called?</p>
      <input ref={nameRef} type = "text" className="nameInputDiv"></input>
      <p className = "roomQuestion"> and which room do you deem fit to enter?</p>
      <select ref={roomSelection} className="roomSelection" >
        <option  value="" ></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
</select>
      <input type= "submit"className= "nameSubmit"></input>
      </form>
    </div>
    </div>
    <div className={"scrollSheet "+ (session==="on"?"scrollSheet2":"")}>
    <div className= {"display "+(instructionDisplayVis==="on"?"":"invisible")}>
        <div className={"infoDisplay "+(playerDisplay==="on"?"infoDisplay2":"invisibleInfo")}>greetings {poetName}</div>
        <div className={"infoDisplay "+(CurrentPlayerDisplay==="on"?"infoDisplay2":"invisibleInfo")}>the current player in your room is : {currentPlayer}</div>
        <div className={"infoDisplay "+(roomDisplay==="on"?"infoDisplay2":"invisibleInfo")}>your room number is : {chatRoom}</div>
        <div className={"infoDisplay "+(refrain.length>0?"infoDisplay2":"invisibleInfo")}>the refrain is : {refrain}</div>

        <div className="line"></div>

      </div>
    <h1 className={"instruction "+(instructionDisplayVis==="on"?"":"invisible")}>{instructionDisplay}</h1>
    

      <div className={"prevSentences "+(instructionDisplayVis==="on"?"":"invisible")}>
        {!allcouplets.length? (
          <div>all couplets</div>
        ):(
          <div className="poem" ref={poemHeight}>
            {allcouplets.map((couplet,index)=>(
              <div key={index}>
                <div className="spaceBetween"></div>
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
        <input type="submit" value="submit couplet"></input>
      </form>

    </div>
    <div className="bottomScroll">
    <button className={instructionDisplayVis==="on"?"":"invisible"}><a href={"data:text/plain;charset=utf-8, "+ JSON.stringify(allcouplets,null,1)} download="poem.txt">download poem</a></button>
    <button className={instructionDisplayVis==="on"?"":"invisible"} onClick={openRules}>see rules of game</button>

    
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
 