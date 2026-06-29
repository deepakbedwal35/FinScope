import EntryCard from "./EntryCard";

export default function SignalConviction({allEntries}){

    return(
        <div className="pt-6  px-4">
            <div>Signal Conviction</div>

             <div className="">
                {allEntries?.map((signal, i)=>(
                    <EntryCard key={signal.name + i} signal = {signal}/>
                ))}

            </div>

        </div>
    )
}