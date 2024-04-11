import Papa from "papaparse"
import { useState, useEffect } from "react";
import './Stylesheets/TradeList.css'

// import Spinner from './Spinner';
import { CSVLink } from 'react-csv';

export default function TradeList (props){

    const trades = props.trades;

    //console.log(trades.length)
    const tradeList = [];
    let exportCSV = [];

    if (trades.length!==0){
        for (let i = 0; i < trades.length; i++) {

                let entry = "", exit = "";
                if (trades[i].QTY < 0){
                    entry = trades[i].entry;
                    exit = trades[i].exit;
                } else {
                    entry = trades[i].exit;
                    exit = trades[i].entry;
                }
                let duration = msToTime(trades[i].duration);

                exportCSV.push(
                    {
                        DATE: trades[i].entryDate,
                        TIME: trades[i].entryTime,
                        DIRECTION: trades[i].direction,
                        SYMBOL: trades[i].symbol,
                        SHARES: trades[i].totalTradeSize,
                        ENTRY: entry,
                        EXIT: exit,
                        DURATION: duration,
                        PnL: (trades[i].tradePnL).toFixed(2),
                        FEES: (trades[i].totalFees).toFixed(2),
                        COMISSIONS: (trades[i].totalComms).toFixed(2)
                    }
                )

                let pnlClass = (trades[i].tradePnL > 0) ? "tradePnL win" : "tradePnL loss"

                tradeList.push(
                    <div className="tradeRow" key={i}>
                        <div className="tradeDate">{trades[i].entryDate}</div>
                        <div className="tradeTime">{trades[i].entryTime}</div>
                        <div className="tradeSymbol">{trades[i].symbol}</div>
                        <div className="tradeDirection">{trades[i].direction}</div>
                        <div className="tradeShares">{trades[i].totalTradeSize}</div>
                        <div className="tradeEntry">${trades[i].entry}</div>
                        <div className="tradeArrow">&rarr;</div>
                        <div className="tradeExit">${trades[i].exit}</div>
                        <div className="tradeDuration">{duration}</div>
                        <div className={pnlClass}>${(trades[i].tradePnL).toFixed(2)}</div>
                        <div className="tradeFeesComms">${(trades[i].totalFees+trades[i].totalComms).toFixed(2)}</div>
                    </div>

                )
        }

        return (
            <>
                <div id="tradeListContainer">
                        <div className="tradeRow headerRow">
                            <div className="tradeDate">DATE</div>
                            <div className="tradeTime">TIME</div>
                            <div className="tradeSymbol">SYMBOL</div>
                            <div className="tradeDirection">L/S</div>
                            <div className="tradeShares">SHARES</div>
                            <div className="tradeEntry">ENTRY</div>
                            <div className="tradeArrow">&rarr;</div>
                            <div className="tradeExit">EXIT</div>
                            <div className="tradeDuration">DURATION</div>
                            <div className="tradePnL">P/L</div>
                            <div className="tradeFeesComms">FEES+COMMS</div>
                        </div>
                    <div id="tradeList">
                        {tradeList}
                    </div>
                        <div id="export">
                            <CSVLink
                                filename={"trades-monocularSL.csv"}
                                data={exportCSV}
                                className=""
                                target="_blank"
                            >
                                <span>Export</span>
                            </CSVLink> 
                        </div>
                </div>
            </>
        );
    } else {
        return(
            <>
                <div id="tradeListContainer">
                        <div className="tradeRow headerRow">
                            <div className="tradeDate">DATE</div>
                            <div className="tradeTime">TIME</div>
                            <div className="tradeSymbol">SYMBOL</div>
                            <div className="tradeDirection">L/S</div>
                            <div className="tradeShares">SHARES</div>
                            <div className="tradeEntry">ENTRY</div>
                            <div className="tradeArrow">&rarr;</div>
                            <div className="tradeExit">EXIT</div>
                            <div className="tradeDuration">DURATION</div>
                            <div className="tradePnL">P/L</div>
                            <div className="tradeFeesComms">FEES+COMMS</div>
                        </div>
                    <div id="tradeList">
                        <span id="noTrades">No Trades Found in File</span>
                    </div>
                </div>
            </>
        )
    }
}


function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    hrs = hrs.toString().padStart(2, '0')
    mins = mins.toString().padStart(2, '0')
    secs = secs.toString().padStart(2, '0')
  
    return hrs + ':' + mins + ':' + secs;
  }