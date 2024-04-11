import Papa from "papaparse"
import { useState, useEffect } from "react";

export default function getTrades (csv, broker) {

    broker="ThinkOrSwim";
    let openPositions = [];
    let orderData = [];
    let tradeList = [];
    let remOpenPositions = [];

    return new Promise((resolve, reject) => {
        try {
            Papa.parse(csv, {
                header: false,
                skipEmptyLines: true,
                skipLines: 0,
                complete: (results )=> {
   
                    let parsedOrders = []
                    switch (broker){
                        case "ThinkOrSwim":
                            parsedOrders = tosParse(results)
                            break;
                        // case "DAS":
                        //     parsedOrders = dasParse(results, openPositions, dasDate)
                        //     break;
                        default:
                            break;
                    }
                    orderData = parsedOrders[0]
                    openPositions = parsedOrders[1]
                    //console.log(orderData.length + " executions parsed");
                    //console.log(orderData)

                    //////////// look for closing trades in execution list and push to trade list
                    for (var i = 0; i<orderData.length; i++){
                        if (orderData[i].cumlSize == 0){
                            let cleanOrder = {
                                ref: orderData[i].REF,
                                symbol: orderData[i].SYMBOL,
                                entryDate: orderData[i].entryDate,
                                entryTime: orderData[i].entryTime,
                                direction: (orderData[i].QTY<0) ? "Long" : "Short",
                                duration: orderData[i].duration,
                                entry: orderData[i].entry,
                                exit: orderData[i].exit,
                                runningPnL: orderData[i].runningPnL,
                                totalComms: orderData[i].totalComms,
                                totalFees: orderData[i].totalFees,
                                totalTradeSize: orderData[i].totalTradeSize,
                                tradePnL: orderData[i].tradePnL,
                            }
                            tradeList.push(cleanOrder);
                        }
                    }

                    ///////// add individual trade PnL & win status  ///////////
                    for (var i = 0; i<tradeList.length; i++){
                        if (i>0){
                            var found = false;
                            for (var n = i-1; (n>=0)&&(found==false); n--){
                                if (tradeList[n].SYMBOL==tradeList[i].SYMBOL && n!=0){ 
                                    tradeList[i].tradePnL = tradeList[i].runningPnL - tradeList[n].runningPnL;
                                    found=true;
                                }
                                else{
                                    tradeList[i].tradePnL = tradeList[i].runningPnL;
                                }
                            }
                        }
                        else {
                            tradeList[i].tradePnL = tradeList[i].runningPnL;
                        }
                        tradeList[i].tradePnL = Math.round((tradeList[i].tradePnL + Number.EPSILON) * 100) / 100;
                        tradeList[i].win = (tradeList[i].tradePnL>0);
                        tradeList[i].unixTime = (new Date(tradeList[i].entryDate+" "+tradeList[i].entryTime).getTime()/1);
                    }

                    // clear openPositions with cumlSize 0 - map to new array
                    for (let i = 0; i < openPositions.length; i++){
                        if (openPositions[i].cumlSize !== 0){
                            remOpenPositions.push(openPositions[i]);
                        }
                    }

                    //console.log(tradeList)
                    //console.log(remOpenPositions)

                    resolve(tradeList)
                },
            });
        } catch (e){
            reject(e)
        }

    });
}

function tosParse (results) {

    let orderData = [];
    let openPositions = [];
    for (let i = 2; i < results.data.length; i++) {
        if (results.data[i][2]=="TRD"){

            let description = results.data[i][4].split(" ");

            let optionSide = description[description.length-2];
            if ((optionSide != "CALL")&&(optionSide != "PUT")){

                let orderQty = "";
                let orderPrice = "";
                let orderSymbol = "";
                if (description[0] !== "KEY:") {
                    orderQty = description[1];
                    orderQty = orderQty.replace('+','');
                    orderQty = orderQty.replace(',','');
                    orderQty = Number(orderQty);
                    orderPrice = description[3];
                    orderPrice = orderPrice.replace('@','');
                    orderPrice = Number(orderPrice);
                    orderSymbol = description[2]
                } else {
                    orderQty = description[4];
                    orderQty = orderQty.replace('+','');
                    orderQty = Number(orderQty);
                    orderPrice = description[6];
                    orderPrice = orderPrice.replace('@','');
                    orderPrice = Number(orderPrice);
                    orderSymbol = description[5]
                }

                var order = {
                    DATE: results.data[i][0],
                    TIME: results.data[i][1],
                    REF: results.data[i][3],
                    TYPE: results.data[i][2],
                    QTY: orderQty,
                    SYMBOL: orderSymbol,
                    PRICE: orderPrice,
                    FEE: Number(results.data[i][5]),
                    COMM: Number(results.data[i][6]),
                };

                order.orderValue = order.PRICE * order.QTY * -1;

                //console.log(order)
                //console.log(openPositions)

                let symbolIndex = openPositions.findIndex((i) => i.symbol === order.SYMBOL);
                let loadedPosition = {};
                if (symbolIndex === -1){
                    loadedPosition = {
                        symbol: order.SYMBOL,
                        openPos: 0,
                        closedPos: 0,
                        avgBuy: 0,
                        avgSell: 0,
                        cumlSize: 0,
                        entryTime: 0,
                        entryDate: 0,
                        totalFees: 0,
                        totalComms: 0,
                    }
                } else {
                    loadedPosition = openPositions[symbolIndex]
                }
                //console.log(loadedPosition)

                let openPos = loadedPosition.openPos;
                let closedPos = loadedPosition.closedPos;
                let avgBuy = loadedPosition.avgBuy;
                let avgSell = loadedPosition.avgSell;
                let cumlSize = loadedPosition.cumlSize;
                let entryTime = loadedPosition.entryTime;
                let entryDate = loadedPosition.entryDate;
                let totalFees = loadedPosition.totalFees;
                let totalComms = loadedPosition.totalComms;
                totalFees = ((totalFees==undefined)||(isNaN(totalFees))) ? 0 : totalFees
                totalComms = ((totalComms==undefined)||(isNaN(totalComms))) ? 0 : totalComms


                    if (order.QTY>0) {             //if a buy
                        avgBuy = ((order.orderValue*-1)+(openPos*avgBuy))/(openPos+order.QTY); //cost of total position / total size.
                        openPos += order.QTY;
                        entryTime = ((entryTime == 0) ? order.TIME : entryTime);
                        entryDate = ((entryDate == 0) ? order.DATE : entryDate);
                        totalFees += order.FEE;
                        totalComms += order.COMM;
                        //      value of current order + value of current posistion / current size + new Size
                    } else {
                        avgSell = ((order.orderValue)+(closedPos*avgSell))/(closedPos+(order.QTY*-1));
                        entryTime = ((entryTime == 0) ? order.TIME : entryTime);
                        entryDate = ((entryDate == 0) ? order.DATE : entryDate);
                        closedPos -= order.QTY;
                        totalFees += order.FEE;
                        totalComms += order.COMM;
                    }

                cumlSize = openPos - closedPos;
                order.avgBuy = avgBuy;
                order.avgSell = avgSell;
                order.entryTime = entryTime;
                order.entryDate = entryDate;

                order.entry = avgBuy;
                order.entry = Math.round((order.entry + Number.EPSILON) * 1000) / 1000;
                order.exit = avgSell;
                order.exit = Math.round((order.exit + Number.EPSILON) * 1000) / 1000;
                order.totalComms = totalComms
                order.totalFees = totalFees

                let totalTradeSize = (openPos + closedPos)/2;

                // resetting position for closed trade
                if (cumlSize==0){
                    order.totalTradeSize = totalTradeSize;
                    closedPos = 0;
                    openPos = 0;
                    avgSell = 0;
                    avgBuy = 0;
                    totalComms = 0;
                    totalFees = 0;
                    let entryDateTime = new Date (entryDate + " " + entryTime)
                    let exitDateTime = new Date (order.DATE + " " + order.TIME);
                    order.duration = exitDateTime - entryDateTime;

                    entryTime = 0;
                    entryDate = 0;
                   
                }
                //closedPos -= order.QTY;
                order.closedPos = closedPos;
                order.openPos = openPos;
                order.avgSell = avgSell;
                order.avgBuy = avgBuy;
                order.cumlSize = cumlSize;

                if (symbolIndex == -1){
                    openPositions.push({
                        symbol: order.SYMBOL,
                        openPos: openPos,
                        closedPos: closedPos,
                        avgBuy: avgBuy,
                        avgSell: avgSell,
                        cumlSize: cumlSize,
                        entryTime: entryTime,
                        entryDate: entryDate,
                        totalComms: totalComms,
                        totalFees: totalFees,
                    })
                } else {
                    openPositions[symbolIndex] = {
                        symbol: order.SYMBOL,
                        openPos: openPos,
                        closedPos: closedPos,
                        avgBuy: avgBuy,
                        avgSell: avgSell,
                        cumlSize: cumlSize,
                        entryTime: entryTime,
                        entryDate: entryDate,
                        totalComms: totalComms,
                        totalFees: totalFees,
                    };
                }
                //console.log(openPositions);

                //set running PnL by ticker
                order.runningPnL = 0;
                var found = false;
                var n = orderData.length;
                while (found == false){ //// look for previous trades on this symbol & same day//////
                    if (n == 0) {
                        let positionValue = (loadedPosition.avgSell*loadedPosition.closedPos)-(loadedPosition.avgBuy*loadedPosition.openPos)
                        order.runningPnL = order.orderValue+positionValue;
                        found = true;
                    }
                    else {
                        n--;
                        if (order.SYMBOL==orderData[n].SYMBOL && order.DATE==orderData[n].DATE){
                            order.runningPnL = orderData[n].runningPnL + order.orderValue;
                            found = true; 
                        } else {}
                    }
                }
                /////push parsed order to orderData list
                orderData.push(order);
            }
        }
    }
    return [orderData, openPositions]
}