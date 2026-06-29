import {useState , useEffect} from "react"
import {useParams} from "react-router-dom"
import ClearIcon from '@mui/icons-material/Clear';
import {userApi} from "../services/api"
import { toast } from "react-hot-toast";
import ToggleButton from "../utils/ToggleButton";
export default function OrderStock({data , handleIsOpen}){
    const {symbol} = useParams() || data;
    const [isMovable , setMovable] = useState(false);
    const [position , setPosition] = useState({x:200 , y:200});
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isSlEntry , setSlEntry] = useState(false);
   
    const price = 544.01;
    const change  = 2.03;

    const handleSubmit = (e)=>{
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("symbol" , symbol);
        formData.set("isOpen" , true);
        const formValues = Object.fromEntries(formData.entries());
        userApi.post("/trades/open" , formValues , {withCredentials: true})
        .then((res)=>{
            toast.success("Trade opened successfully!");
            handleIsOpen(false);
        })
        .catch((err)=>{
            toast.error("Failed to open trade: " + err.message);
        })
        // console.log(formValues);
        // alert(formValues)
        // toast.success(formValues);
    }
    const handleBuyClick =()=>{
        handleIsOpen(false);

    }
    const handleHeaderMouseDown = (e)=>{
        setMovable(true);
        const cardCords = e.currentTarget.parentElement.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - cardCords.left,
            y: e.clientY - cardCords.top
        });
        e.preventDefault();
    }
    useEffect(()=>{
        const handleMouseMove = (e)=>{
            if(!isMovable) return;

            
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
            
        }

        const handleMouseUp =()=>{
            setMovable(false);
        } 
        if (isMovable) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isMovable, dragOffset]);

    return(
        
        <div className=" font-mono text-lg fixed inset-0 pointer-events-none z-10">

          
            <div  style={{ 
                    position: 'absolute',
                    left: `${position.x}px`, 
                    top: `${position.y}px`,
                    width: '500px',
                    height: '350px'
                }} className=" overflow-hidden  shadow-lg  flex pointer-events-auto flex-col text-white  rounded-lg bg-neutral-950 border border-green-900/50">
            
               
                <div  onMouseDown={handleHeaderMouseDown} className={` flex items-center  p-4 bg-emerald-700/20 border-b border-b-green-900/50 text-sm cursor-move font-semibold select-none transition-colors duration-200` }>
                    <div className="text-lg tracking-wider font-sans font-medium"> {symbol} <div className={`text-sm pl-1 text-gray-300 tracking-tight font-medium ${change >0 ?"text-green-500" :"text-red-400"}`}>₹{price} <span className=" text-xs text-gray-300">({change })</span></div></div>
                    <button onClick={handleBuyClick} className="absolute top-2 right-2 text-center flex items-center  p-2 cursor-pointer text-gray-400 hover:text-white">
                        <ClearIcon />
                    </button>
                </div>

                

                    <form onSubmit={handleSubmit} className="text-gray-200   font-mono text-sm font-medium pt-4 pl-4 flex-1 overflow-y-auto pr-7 pb-5">
                        <div className="flex flex-wrap justify-between">
                            <div className="flex flex-col p-2   gap-2"> 
                                <label for="share">Quantity</label>
                                <input  type="number" name="positionSize" id="share" min={1} className="p-2  bg-neutral-900 rounded-lg border border-white/20" required />
                            </div>

                            <div className="flex flex-col p-2  gap-2"> 
                                <label for="entry">Entry Price</label>
                                <input type="number" id="entry" name="entryPrice" min={1} className="p-2  bg-neutral-900  rounded-lg border  border-white/20" required/>
                            </div>

                        </div>
         
                        <div className="flex flex-row   justify-between gap-2">
                            <div className="flex flex-col p-2  gap-2"> 
                                <label for="sl">Stop loss</label>
                                <input type="number" name="stoploss" id="sl" min={1} className="p-2 m-1 bg-neutral-900 rounded-lg border  border-white/20" required/>
                            </div>
                            <div className="flex flex-col p-2  gap-2"> 
                                <label for="target">Target</label>
                                <input type="number" id="target" name="target" min={1} className="p-2 m-1  bg-neutral-900 rounded-lg border  border-white/20" required/>
                            </div>


                        </div>
                        

                        <div className=""> <button className='cursor-pointer px-6 py-2 pt-1 mt-2 pb-1 rounded-lg bg-green-600/50 hover:shadow-sm hover:bg-green-800/70 border border-green-800/10' type="submit">Buy</button></div>
                    

                    </form>
                
                

            </div>
           
            
        </div>
       

    )

}
