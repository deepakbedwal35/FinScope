import {  useState } from "react";
export default function TicTacToe(){
   let [board , setboard] = useState(Array(9).fill(null));
    let [isX , setIsX] = useState(true);
    let [winner , setWinner] = useState(null);
    const winPatterns = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ]
    function checkWinner(board){
        for ( let pattern of winPatterns){
            const [a, b , c] = pattern;
            if(board[a] && board[a]=== board[b] && board[a] === board[c]){
                return board[a];
            }

        }

        return null;
    }
    function handleClick(index){
        if(board[index] ){
            console.log("Already occupied , Try another position");
            return;
        }
        if(winner){
            console.log("Game already won by " + winner);
            return;
        }

        const newboard = [...board];
        if(isX) newboard[index] = "X";
        else  newboard[index] = "O";
        setboard(newboard);
        setIsX(!isX);
        const w = checkWinner(newboard);
        if(w) setWinner(w)
        

        

    }
    return (
        <div>
            {winner && <h2 className="text-2xl font-bold mb-4">Winner: {winner}</h2>}
            <button className="border-2  p-2 ml-6 rounded-2xl bg-green-500" >Start Game</button>
        <div className="m-4 bg-amber-100 box-content size-64 border-amber-50 border-0 grid grid-cols-3 grid-rows-3  ">
            {board.map((val , index)=>(
                 <div
      key={index}
      className="border-2  border-black bg-amber-800 text-blue-50 flex items-center justify-center"
      onClick={() => handleClick(index)}>
        {val}
        </div>
        ))}
         </div>


        {winner !==null && (
        <button className="border-2 p-2 " onClick={() => {
          setboard(Array(9).fill(null))
          setWinner(null)
          setIsX(true)
        }}>
          Play again
        </button>
        )}
            
            
       
            
        </div>

        
    )
}