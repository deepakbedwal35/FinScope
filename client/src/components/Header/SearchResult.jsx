import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import {Link , useNavigate} from 'react-router-dom';
import {useState , useEffect} from 'react';
import { toast } from 'react-hot-toast';
import HandleWatchlist from "../handleWatchlist"

export default function SearchResult({searchResult}){
    const navigate = useNavigate();
    const [watchlistSymbol, setWatchlistSymbol] = useState(null);

    const handleWatchlist = (e, symbol) => {
        e.stopPropagation();
        e.preventDefault();
        setWatchlistSymbol(symbol);
    }

    const handleOnClick = (symbol)=>{
        try{
            navigate(`/analyse/${symbol}`);
            toast.success("Successful");
        }catch{
            toast.error("Something went wrong ! Try again ");
        }
    }

    return (
        <div className="absolute text-white h-5/12 flex flex-col justify-center ml-2 z-10 mt-2 w-3/10 origin-top-right divide-y border border-white/10 rounded-md bg-neutral-900">
            {!searchResult && <div className="text-center flex flex-col p-2 text-gray-200 items-center justify-center"> 
                <div className="font-extrabold">No Result Found</div>
                <div>Please try using different keywords.</div>
            </div>}

            {searchResult && <div className="h-full overflow-x-auto whitespace-nowrap scroll-smooth md:scroll-auto scrollbar-hide transition duration-150 ease-in-out">
                {searchResult?.map((stocks, index)=>( 
                    <div 
                        onClick={()=>handleOnClick(stocks?.display)}
                        onMouseDown={(e)=>{ e.preventDefault(); }}
                        key={stocks?.display || index} 
                        className="cursor-pointer justify-between pl-3 p-3 border-b border-white/10 hover:bg-neutral-600/30 flex flex-row items-center"
                    >
                        <div>{stocks?.display}</div>
                        <div onClick={(e)=>{handleWatchlist(e, stocks?.display)}}>
                            <BookmarkAddOutlinedIcon/>
                        </div>
                    </div>
                ))}
            </div>}

            {watchlistSymbol && (
                <HandleWatchlist 
                    symbol={watchlistSymbol} 
                    onDone={() => setWatchlistSymbol(null)} 
                />
            )}
        </div>
    )
}