import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";

function GameEnd({ hadnleRestart, winner, tie, celltype }) {
  return (
    <div className="endview">
      <div>
        {winner && <p>Winner is {celltype}</p>}
        {tie && <p>No Winner</p>}
      </div>
      <button className="restartButton" onClick={hadnleRestart}>
        restart
      </button>
    </div>
  );
}

function App() {
  const [celltype, setCelltype] = useState("");
  const [winner, setWinner] = useState(false);
  const [tie, setTie] = useState(false);
  const [boards, setBoards] = useState(
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null))
  );
  const handleChangeCell = (row, column) => {
    const copy = [...boards];
    if (celltype === "" || celltype === "O") {
      copy[row][column] = "X";
      setCelltype("X");
    }
    if (celltype === "X") {
      copy[row][column] = "O";
      setCelltype("O");
    }

    setBoards(copy);
  };

  // when clicked will REstart game
  const hadnleRestart = () => {
    setWinner(false);
    setTie(false);
    setCelltype("");
    setBoards(
      Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null))
    );
  };

  // detect win or tie
  useEffect(() => {
    if (winner) return;

    const copy = [...boards];
    for (let i = 0; i < 3; i++) {
      // row 贏的規則
      if (
        copy[i][0] !== null &&
        copy[i][0] === copy[i][1] &&
        copy[i][1] === copy[i][2]
      ) {
        
        return setWinner(true);
      }

      // cloumns 贏的規則
      if (
        copy[0][i] !== null &&
        copy[0][i] === copy[1][i] &&
        copy[1][i] === copy[2][i]
      ) {
        return setWinner(true);
      }
    }

    // 正斜線上贏的規則
    if (
      copy[0][0] !== null &&
      copy[0][0] === copy[1][1] &&
      copy[1][1] === copy[2][2]
    ) {
      return setWinner(true);
    }

    // 反斜線上贏的規則
    if (
      copy[0][2] !== null &&
      copy[0][2] === copy[1][1] &&
      copy[1][1] === copy[2][0]
    ) {
      return setWinner(true);
    }

    //判斷沒有贏家的狀況
    let fill_columns = false;
    let fill_rows = false;
    for (let i = 0; i < 3; i++) {
      fill_columns =
        copy[0][i] !== null && copy[1][i] !== null && copy[2][i] !== null;
      fill_rows =
        copy[i][0] !== null && copy[i][1] !== null && copy[i][2] !== null;
    }
    if (fill_columns && fill_rows) return setTie(true);

  }, [boards, winner]);


  return (
    <div className="container">
      <div style={{textAlign: "center"}} className={`${(winner || tie) && "viewblur"}`}>
        <h1>Tac Toe Tic</h1>
        <table>
          <tbody>
            {boards.map((rows, rowsIndex) => (
              <tr key={rowsIndex}>
                {rows.map((columns, columnsIndex) => (
                  <td
                    className={columns ? "shield" : ""}
                    key={columnsIndex}
                    onClick={() => handleChangeCell(rowsIndex, columnsIndex)}
                  >
                    {columns}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(winner || tie) && (
        <GameEnd
          hadnleRestart={hadnleRestart}
          winner={winner}
          tie={tie}
          celltype={celltype}
        />
      )}
    </div>
  );
}

export default App;
