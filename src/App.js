import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import TradeList from './Components/TradeList';
import getTrades from './functions/getTrades';

function App() {

  const [showTrades, setShowTrades] = useState(false);
  const [selectedFile, setSelectedFile] = useState("none");
  const [trades, setTrades] = useState([])

  const setFile = (e) => {
    e.preventDefault();
    console.log(e)
    setSelectedFile(e.target.files[0]);
  }

  const submit = async (e) => {
    e.preventDefault();
    console.log(selectedFile)

    let tradesJSON = []
    try {
      tradesJSON = await getTrades(selectedFile)
    } catch (e) {
      console.log(e)
      tradesJSON = []
    }

    setTrades(tradesJSON)
    setShowTrades(true);
  }

  const reset = () => {
    setShowTrades(false)
    setSelectedFile("none")
    setTrades([])
  }

  if (showTrades===false){
    return (
      <div className="App">
        <header className="vertCenter logoText">monocular <span>by Sniper Log</span></header>
        {(selectedFile==="none") ?
          <div id="dropbox">
            <label htmlFor="csv_upload">Select your CSV file*</label>
            <input className="center" type="file" id="csv_upload" name="csv_upload" title="csv_upload" accept=".csv" onChange={setFile}/>
          </div>
        :
          <div id="dropbox">
            <h5>{selectedFile.name}</h5>
            <div id="buttonRow"><button onClick={submit} title="goButton" id="goButton">Go</button><button onClick={reset} id="resetButton">Clear</button></div>
          </div>
        }
        <div id="guidelines">
          <ul>
            <li>Currently only supporting ThinkOrSwim (Use the AccountStatment.csv)</li>
            <li>Your CSV file must begin with no open positions.</li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div className="App">
        <header className="logoText">monocular <span>by Sniper Log</span></header>
        <TradeList trades={trades}/>
        <div id="resetButtonContainer">
        <button onClick={reset} id="resetButton">Reset</button>
        </div>
      </div>
    )
  }
}

export default App;
