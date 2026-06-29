

export default function News({type , newsDetail}){

    const sentimentUI = {
    Positive: {
        text: "text-green-400",
        bg: "bg-green-900/20",
        
        label: "Positive",
        border:"border-green-400/20",
    },
    Negative: {
        text: "text-red-400",
        bg: "bg-red-900/20",
        label: "Negative",
        border:"border-red-900/20"
    },
    };
    const sentiment =
    sentimentUI[type] || {
         text: "text-yellow-400",
        bg: "bg-yellow-900/20",
       
        label: "Mixed",
        border:"border-yellow-400/20"
    };


         

    return(
        <div className="mt-2 p-4 my-8 ">
             <div className={` text-lg font-medium ${sentiment.text}`} >
                <div className="mb-4"> {type} News</div>
                {newsDetail.length === 0 && <div className={`p-4 mt-30 text-sm text-center text-gray-300 `}>Recently no {type} News</div>}

                <div className=" flex flex-col  gap-2 max-h-[300px]  overflow-y-auto whitespace-nowrap scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out" >
                    {newsDetail?.map((news)=>(
                        <div className={`border  whitespace-normal rounded-lg p-4 mt-2 ${sentiment.border , sentiment.bg}`}>
                            <div className="text-lg text-white">{news?.title}</div>
                            <div className="text-sm font-light">{news?.detail}</div>
                            <div className="flex flex-row mt-4 text-sm/2 text-gray-500">
                                <div className="">{news?.category}</div>
                                <div  className="ml-2">{news?.date_approx}</div>
                                <div  className="ml-2">Impact {news?.impact}/10</div>
                            </div>
                            
                        </div>
                    ))      
                }              
                </div>      
            
            </div>
        </div>
    )
}