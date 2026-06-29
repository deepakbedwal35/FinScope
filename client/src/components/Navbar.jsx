import {useState} from "react"
export default function Navbar({tabs , activeTab , setActiveTab}){
    
    return (
        <div  className=" font-mono rounded-t-xl flex flex-row font-medium mx-4  mb-4 text-normal border-b-2  border-gray-600 bg-neutral-900   overflow-x-auto whitespace-nowrap scroll-smooth sm:scroll-auto scrollbar-hide transition duration-150 ease-in-out   ">{
            tabs.map(tab=>(
                <button  key={tab} onClick={()=>setActiveTab(tab)} className={` cursor-pointer hover:bg-blue-600/10 gap-2 hover:rounded-t-xl px-6 p-2 
                        ${activeTab === tab ? "border-b-2 rounded-tl-xl text-blue-500  " : "text-white"} `}>
                    {tab}
                </button>
            ))}
        </div>
    )
}