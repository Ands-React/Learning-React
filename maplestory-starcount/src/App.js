import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";

function Title() {
  return (
    <div className="titlelay">
      <h1>楓之谷星力計算</h1>
    </div>
  );
}

function AllCost({allcost, startcount}){
  return(
    <div>
      <table>
        <tr>
          <th>升星</th>
          <th>階段花費</th>
        </tr>
        {allcost.map((singlecost)=><tr key={singlecost.id}><td>{startcount}<span className="arrow">&#8594;</span>  {startcount+=1}</td><td className="stagecost" >{Math.floor(singlecost).toLocaleString("en-US")}</td></tr>)}
      </table>
    </div>
  )
}

function Calculate(start, end, level) {
  const count = []
  for (let currentcount = start; currentcount < end; currentcount++) {
    let temp;
    if (currentcount < 10) {
      temp = 1000 + (level ** 3 * (currentcount + 1)) / 25;

    }else if (currentcount + 1 === 11) {
      temp = 1000 + (level ** 3) * (currentcount+1) ** 2.7 / 200;

    }else if(currentcount >= 11 && currentcount < 15){
      temp = 1000 + (level ** 3) * (currentcount+1) ** 2.7 / 66.7;

    }else if(currentcount >= 15 && currentcount < 20){
      temp = 1000 + (level ** 3) * (currentcount+1) ** 2.7 / 50;

    }else if(currentcount >= 20 && currentcount < 25){
      temp = 1000 + (level ** 3) * (currentcount+1) ** 2.7 / 40;
      
    }
    count.push(temp)
  }
  return count;
}
function TypeInStar() {
  const [startcount, setStarcount] = useState(0);
  const [endcount, setEndcount] = useState(0);
  const [level, setLevel] = useState(0);
  const [result, setResult] = useState(0);
  const [allcost,setAllcost] = useState(null);
  const [showtable, setShowtable] = useState(false);

  const handleStartChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (newValue < endcount) {
      setStarcount(newValue);
    }
  };
  const handleEndChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (newValue > startcount) {
      setEndcount(newValue);
    }
  };
  const handleStartCount = () => {
    const total = Calculate(startcount, endcount, level);
    setResult(Math.floor(total.reduce((prev, curr)=>prev + curr)).toLocaleString('en-US'))
    setAllcost(total)
    setShowtable(true)
  };

  return (
    <div className="container">
      <div>
        <label for="level">裝備等級：</label>
        <input
          id="level"
          type="number"
          onChange={(e) => setLevel(e.target.value)}
        />
      </div>
      <div>
        <label for="start">起始星力：</label>
        <input
          type="number"
          min={0}
          max={25}
          value={startcount}
          onChange={handleStartChange}
          id="start"
        />
        <span>~</span>
        <input
          className="end"
          type="number"
          min={0}
          max={25}
          value={endcount}
          onChange={handleEndChange}
          id="end"
        />
        <label for="end"> :預計星力</label>
        <button style={{ margin: "10px" }} onClick={handleStartCount}>
          計算
        </button>
      </div>
      {result !== null && <div>總共費用：{result}</div>}
      {showtable ? <AllCost allcost={allcost} startcount={startcount}/> : ""}
    </div>
  );
}

function App() {
  return (
    <div>
      <Title />
      <TypeInStar />
    </div>
  );
}

export default App;
