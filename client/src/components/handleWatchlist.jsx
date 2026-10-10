import { notify } from "../services/notify";
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
                notify.success("Successfully added to watchlist", "watchlist-action");
            })
            .catch((err)=>notify.error(err.message, "watchlist-action"))
            .finally(()=> onDone?.())
    }, [symbol])

    return (<></>)
}