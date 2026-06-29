import { toast } from "react-hot-toast";
import { userApi } from "../services/api"
import { useState, useEffect, useRef} from "react"

export default function HandleWatchlist({ symbol, onDone }){
    const [addStock, setStock] = useState({});
    const hasRun = useRef(false);
    useEffect(()=>{
        if (hasRun.current) return;
        hasRun.current = true;
        userApi.post("/watchlist/add", { symbol })
            .then((res)=>{
                setStock(res.data.data);
                toast.success("Successfully Added in watchlist")
            })
            .catch((err)=>toast.error("Stock Already in watchlist " + err.message ))
            .finally(()=> onDone?.())
    }, [symbol])

    return (<></>)
}