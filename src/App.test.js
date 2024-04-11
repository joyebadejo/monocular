import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import Papa from "papaparse"
import TradeList from './Components/TradeList';
import getTrades from './functions/getTrades';
import fs from "fs"

// describe("Get Trades-TOS", () => {
//   test("Proper form function, rejecting non CSV files", () => {
//     render(<App />);
//     const setFile = jest.fn();
//     const uploadElement = screen.getByText("Select your CSV file*");
//     expect(uploadElement).toBeInTheDocument();
//     //const csv_upload = screen.queryByRole("input", { name: /csv_upload/i });
//     const csv_upload = screen.getByTitle("csv_upload");
//     expect(csv_upload).toBeInTheDocument();
//     const file = require('./tos.csv');
//     fireEvent.change(csv_upload, {
//       target: {
//         files: [new File([], 'tos.csv', {type: 'image/png'})],
//       },
//     });
//   });
// });


test("Proper parsing of TOS CSV file", async () => {

  let loadedCSV = await readCSV('src/test/tos.csv')

  expect.assertions(1);
  return getTrades(loadedCSV, "ThinkOrSwim").then(data => {
    expect(data).toMatchObject(desiredResult);
  });

});

const readCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath)
  const csvData = csvFile.toString()
  return csvData
}

const desiredResult = [
  {
      "ref": "1748382509",
      "symbol": "TSLA",
      "entryDate": "11/1/23",
      "entryTime": "07:36:23",
      "direction": "Long",
      "duration": 10000,
      "entry": 199.71,
      "exit": 199.82,
      "runningPnL": 0.5499999999998408,
      "totalComms": 0,
      "totalFees": -0.02,
      "totalTradeSize": 5,
      "tradePnL": 0.55,
      "win": true,
      "unixTime": 1698849383000
  },
  {
      "ref": "1748383643",
      "symbol": "SPY",
      "entryDate": "11/1/23",
      "entryTime": "07:37:24",
      "direction": "Long",
      "duration": 28000,
      "entry": 421.44,
      "exit": 421.47,
      "runningPnL": 0.060000000000002274,
      "totalComms": 0,
      "totalFees": -0.02,
      "totalTradeSize": 2,
      "tradePnL": 0.06,
      "win": true,
      "unixTime": 1698849444000
  },
  {
      "ref": "1748383676",
      "symbol": "TSLA",
      "entryDate": "11/1/23",
      "entryTime": "07:37:00",
      "direction": "Short",
      "duration": 68000,
      "entry": 199.76,
      "exit": 199.84,
      "runningPnL": 0.6299999999998533,
      "totalComms": 0,
      "totalFees": -0.01,
      "totalTradeSize": 1,
      "tradePnL": 0.57,
      "win": true,
      "unixTime": 1698849420000
  }
]
