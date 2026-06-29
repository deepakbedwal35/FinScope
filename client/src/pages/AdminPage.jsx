import {useState , useEffect} from "react"
import {api} from "../services/api"
import { toast } from "react-hot-toast";
export default function AdminPage(){
    const [runFullScan , setFullScan] = useState("");
    const [addRecom , setRecom] = useState("");
    const handleFullscan = ()=>{
        api.get("/runfullscan" )
        .then((res)=>{
            setFullScan(res.data);
            toast.success("FullScan Complete")
        })
        .catch((e)=> toast.error("Error:" + e.message))
    }
    const addRecommendationInDB = ()=>{
        api.get("/recommends/add")
        .then((res)=>{
            setRecom(res.data)
        })
        .catch((err)=>toast.error("Error in Recommendation" + err.message));
    }

    return(
        <div className="text-white flex flex-col">
            Admin page
            <button onClick={handleFullscan} className="border-white/40 border cursor-pointer p-2"> Full Scan</button>
            {runFullScan && <div>Succesfully run full scan</div>}
            <button className={"cursor-pointer p-2 border m-2"} onClick={addRecommendationInDB}>
                Add Recommendation</button>
                {addRecom && <div> successfully added </div>}
        </div>
    )

}