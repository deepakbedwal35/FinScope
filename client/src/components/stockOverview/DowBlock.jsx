export default function Block({title , value , desc ,color }){

    return(
        <div className="p-3 m-4 font-sans border-white/20  border tracking-wider font-medium flex flex-col rounded-lg bg-neutral-800/50 text-white delay-150  hover:shadow-lg ">
            <div className="pb-2 text-sm  text-purple-400 tracking-wider font-medium">{title}</div>
            <div className={`pb-2 font-bold text-xl`} style={{ color: color }}>{value}</div>
            <div className="pb-2 text-sm text-gray-100 " >{desc}</div>

        </div>
    )

}