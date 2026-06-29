import IndicatorBlock from "../components/stockOverview/IndicatorBlock.jsx"

export default function Indicators({ indicators }) {
    return (
        <div>
           
            <IndicatorBlock title={"RSI(14)"} signal={indicators?.rsi?.signal} color={indicators?.rsi?.color} value = {indicators?.rsi?.value} diverg={indicators?.rsi?.divergence}/>
            <IndicatorBlock title={"MACD(12,26,9)"} signal={indicators?.macd?.signal} color={indicators?.macd?.color} value = {indicators?.macd?.value} desc={indicators?.macd?.description}/>
            <IndicatorBlock title={"Bollinger Bands (20,2)"} signal={indicators?.bb?.signal} color={indicators?.bb?.color} value = {indicators?.bb?.value} desc={indicators?.bb?.description} upper = {indicators?.bb?.upper} lower={indicators?.bb?.lower} mid={indicators?.bb?.mid} squeeze={indicators?.bb?.squeeze}/>
            <IndicatorBlock title={"Moving Averages + ATR"} sma_20={indicators?.ma?.sma_20} sma_50={indicators?.sma?.sma_50} sma_100= {indicators?.ma?.sma_100} sma_200={indicators?.ma?.sma_200} atr={indicators?.atr?.value}/>
            
        </div>
    )
}