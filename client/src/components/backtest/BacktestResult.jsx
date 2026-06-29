import { useState } from "react";
import BackTestCard from "./BacktestCard";
import BacktestGrade from "./BacktestGrade";
import BacktestOutcomeCard from "./BacktestOutcomeCard";
import BacktestTradelog from "./BacktestTradelog";
import Tooltip from "@mui/material/Tooltip"

export default function BacktestResult({tradelog}){
    
    const [getYear , setYear] = useState(2026);

    return (
        <div>
            <div className="m-4 p-4 rounded-2xl bg-neutral-900">
                <div className="text-xl tracking-wider p-2">Results : {tradelog.total_trades} Signals </div>
                <div className="flex flex-wrap  justify-between m-4 ">
                    <Tooltip title={"Model is win if rally is above 3%"}>
                         <BackTestCard  title={"MODEL ACCURACY"} value = {tradelog?.model_win_rate} desc={"Directional wins"} sign="%"/>
                    </Tooltip>
                    <Tooltip>
                        <BackTestCard title={"TRADE WIN RATE"} value = {tradelog?.win_rate} desc={"Strict P&L wins"} sign="%"/>
                    </Tooltip>

                    <Tooltip>
                        <BackTestCard title={"AVG RETURN"} value = {tradelog?.avg_return} desc={"Per trade"} sign="%"/>
                    </Tooltip>
                    <Tooltip>
                        <BackTestCard title={"PROFIT FACTOR"} value = {tradelog?.profit_factor} desc={"Gross win/loss"} />
                    </Tooltip>
                    <Tooltip>
                        <BackTestCard title={"EXPECTANCY"} value = {tradelog?.expectancy} desc={"Per trade EV"}/>
                    </Tooltip>
                    <Tooltip>
                        <BackTestCard title={"AVG LOSS"} value = {tradelog?.avg_loss} color={"red"} desc={"Avg losing trade"} sign="%"/>
                    </Tooltip>
                    <Tooltip>
                        <BackTestCard title={"AVG Hold"} value = {tradelog?.avg_hold} color={"bg-neutral-600"} desc={"Avg holding days"} sign=" days"/>
                    </Tooltip>

                    <Tooltip title={" score showing if your profits are worth the risk. Higher than 1.0 means you are getting good returns without taking wild risks."}>
                        <BackTestCard title={"SHARPE"} value = {tradelog?.sharpe}  desc={"Risk-Adjusted Return"}/>
                    </Tooltip>  
                </div>  
            </div>
                
                <div className="grid grid-cols-2"> 
                    {/* outcomes */}
                    <div className="m-4 p-4 rounded-2xl bg-neutral-900">
                        <div className="text-lg tracking-wider  p-2">Outcome Breakdown  </div>
                        <div className="flex flex-wrap justify-between m-4 ">
                            <BacktestOutcomeCard title="T2 Hit" value = {tradelog?.outcomes?.T2_HIT} desc={"Full Target"} />
                            <BacktestOutcomeCard  title="T1 Hit" value = {tradelog?.outcomes?.T2_HIT} desc={"First Target"}/>
                            <BacktestOutcomeCard  title={"Part. Rally"} value = {tradelog?.outcomes?.PARTIAL_RALLY} desc={"Model win , no SL"}/>
                            <BacktestOutcomeCard title="SL Hit" value = {tradelog?.outcomes?.SL_HIT} desc={"Full Stop Loss"} />
                        </div>
                    </div> 
                    {/* Grade */}
                    <div className="m-4 p-4 mb-4 rounded-2xl bg-neutral-900">
                        <div className="text-lg tracking-wider p-2">Grade Breakdown </div>
                        <div className="flex gap-2 flex-wrap mt-2 justify-between">
                            {Object.entries(tradelog?.by_grade || {}).map(([grade, metrics]) => (
                                <BacktestGrade grade={grade} metrics = {metrics}/>
                            ))}
                        </div>
                    </div> 
                </div>

           {/* Tradelog */}
          <div className="bg-neutral-900 m-4 p-4 rounded-xl">
                  <div className="flex justify-between">
                     <div className=" tracking-wider ml-4 text-lg">Trade log</div>
                     {!tradelog?.backtest_years && <div> c cd</div>}
                     <div className="flex items-center gap-2 mr-4">
                        <select
                            name="category"
                            value={getYear}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-neutral-900/20 rounded-lg border border-gray-100/20 p-1"
                            >
                            {tradelog?.backtest_years?.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>   
                     </div>
                  </div>
                  <div>
                    <BacktestTradelog tradelog={tradelog?.trades} year={getYear}/>
                    
                </div>
                

            </div>

        
            
        </div>
    )

}

