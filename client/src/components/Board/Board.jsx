import React,{useEffect, useState} from 'react';
import Square from './Sqaure';
import { useChannelStateContext,useChatContext } from 'stream-chat-react';
import {Patterns} from './WinningPatterns';
import './Board.css'

const Board = ({result,setResult}) => {
    const [board,setBoard] = useState(["","","","","","","","",""]);
    const [player,setPlayer] = useState("X");
    const [turn,setTurn] = useState("X");
    const [matchEnded,setMatchEnded] = useState(false);
    const [winnerID,setWinnerID] = useState();
    const [looserID,setLooserID] = useState();


    const {channel} = useChannelStateContext();
    const {client} = useChatContext();

    //Everytime there is a change in board-state we check wether there is a winner or not
    useEffect(()=>{
        checkWin();
        checkIfTie();
    },[board]);

    const chooseSquare=async(square)=>{
        if(!matchEnded && turn === player && board[square]===""){
            setTurn(player === "X"?"O":"X");

            //sending data of the board to other player
            await channel.sendEvent({
                type:"game-move",
                data:{square,player}
            })

            setBoard(board.map((val,idx)=>{
                if(idx === square && val === ""){
                    return player;
                }

                return val;
            }));
        }
    };


    channel.on((event)=>{
        if(result.status!="won" && result.status!="tie" && event.type=="game-move" && event.user.id !== client.userID){
            const currentPlayer = event.data.player === "X" ? "O":"X";
            setPlayer(currentPlayer);
            setTurn(currentPlayer);

            // console.log('Event User:',event.user);
            // console.log('UESRID CLIENT:',client);
            setWinnerID(event.user.id);
            setLooserID(client.user.id);

            setBoard(board.map((val,idx)=>{
                if(idx === event.data.square && val === ""){
                    return event.data.player;
                }

                return val;
            }));
        }
    })


    const checkWin = () =>{
        Patterns.forEach((currPattern)=>{
            const firstPlayer = board[currPattern[0]];
            if(firstPlayer == "") return;
            let foundWinningPattern = true;
            currPattern.forEach((idx) => {
                if(board[idx] != firstPlayer){
                    foundWinningPattern = false;
                }
            });

            if(foundWinningPattern){
                alert(`Game has Ended and winner is: ${board[currPattern[0]]}`);
                setResult({winner:board[currPattern[0]],status:"Won"});
                setMatchEnded(true);
            }
        })
    }

    const checkIfTie = () =>{
        let filled = true;

        board.forEach((square)=>{
            if(square==""){
                filled=false;
            }
        });

        if(filled){
            alert(`Game has Ended and it is a TIE`);
            setResult({winner:"none",state:"tie"});
            setMatchEnded(true);
        }
    }

    const handleExit = async() =>{
        //check match ended or not

        if(matchEnded){
            //the incremenet the wins of the winner and update gaming history of both the players, then navigate to dashboard screen
        }else{
            
        }
    }

  return (
    <div className="board">

            <div className='top-game-content'>
                <h1 className='in-game-text ingame-text-1'>You are Player: {player}</h1>
                <h1 className='in-game-text ingame-text-2'>Current Player's Turn: {turn}</h1>
            </div>

        <div className="tictactoe board-in-game">

            <br/>

            <div className="square-row">
                <Square chooseSquare={()=>{chooseSquare(0)}} val={board[0]}/>
                <Square chooseSquare={()=>{chooseSquare(1)}} val={board[1]}/>
                <Square chooseSquare={()=>{chooseSquare(2)}} val={board[2]}/>
            </div>
            <div className="square-row">
                <Square chooseSquare={()=>{chooseSquare(3)}} val={board[3]}/>
                <Square chooseSquare={()=>{chooseSquare(4)}} val={board[4]}/>
                <Square chooseSquare={()=>{chooseSquare(5)}} val={board[5]}/>
            </div>
            <div className="square-row">
                <Square chooseSquare={()=>{chooseSquare(6)}} val={board[6]}/>
                <Square chooseSquare={()=>{chooseSquare(7)}} val={board[7]}/>
                <Square chooseSquare={()=>{chooseSquare(8)}} val={board[8]}/>
            </div>

        </div>

        <br/>
      <button onClick={()=>{handleExit()}} className='game-exit-button'>Exit Lobby</button>
    </div>
  )
}

export default Board