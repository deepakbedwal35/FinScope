import { Link } from "react-router-dom";
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import {useNavigate} from "react-router-dom"
import { useState } from "react";
import { userApi } from "../services/api";
import {toast} from "react-hot-toast"
function StockCard({searchStock}) {
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  

  const handleCardClick = ()=>{
    navigate(`/analyze/${searchStock?.display}`);
  }
 

  const handleWatchlistClick = (e)=>{
    e.stopPropagation();  
    if(isInWatchlist){
      // remove from watchlist
      setIsInWatchlist(false);
      
     }
    
    else{
      // add to watchlist
     userApi.post("/watchlist/add" , {symbol: searchStock?.display} , {withCredentials: true})
     .then((res)=>{
         
      
        console.log("SERVER RESPONSE PAYLOAD:", res.data);

       
        if (res.data && res.data.success === true) {
          toast.success("Added to watchlist!");
          setIsInWatchlist(true); 
        }  
      
     })
     .catch((err)=>{
      toast.error("Failed to add to watchlist: " + err.message);
     })
   }
  }
  return (
   
    <div onClick={handleCardClick} className="flex  my-2 rounded-2xl cursor-pointer justify-between px-5 py-3 dark:bg-gray-800 hover:bg-gray-700 transition-colors">
      <div>
        <div className="text-white font-semibold"> {searchStock?.display} </div>
        <div className="text-gray-400 text-sm  font-light">{searchStock?.symbol}</div> 
      </div>

      {!isInWatchlist &&
      <div onClick={handleWatchlistClick} className="flex items-center"><BookmarkAddOutlinedIcon sx={{ color: '#ffffff' }} /></div>
      }

      {isInWatchlist &&
      <div onClick={handleWatchlistClick} className="flex items-center"><TurnedInIcon sx={{ color: '#ffffff' }} /></div>
      }
    </div>
   
  );
}

export default StockCard