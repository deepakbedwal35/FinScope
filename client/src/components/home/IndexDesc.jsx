import Activity from "../Activity";
import Week52 from "../stockOverview/52Week";

export default function IndexDesc({ data }) {
    if (!data) return null;

    return (
        <div className="w-full mt-4  p-4 rounded-xl border  border-neutral-800">
            <div className="py-2 grid grid-cols text-[15px] font-light mx"> 
                <Activity data = {data}/>
            </div>
            <div className="pt-4 mx-4">
                <Week52 stockData={data} />
            </div>
        </div>
    );
}
