import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useSelector, useDispatch} from 'react-redux'
import { setCheck, setTarget, setReset, setCalcu, setStatemt } from './features/calculatorSlice' // Added setTarget

function App() {
  const calculator = useSelector(state => state.calculator)
  const dispatch = useDispatch()

  const  handleCalculate = () => {
    dispatch(setStatemt())
    dispatch(setCalcu())
  }

  return (
    <>
      <div className='container'>
        <div className='displayresult'>
          <div>{calculator.statment}</div>

          <div>
            {
            // 三元運算子 (elseif)：
            calculator.value === 0 ? "" : // value 為 0，尚未輸入數字顯示空字串
            calculator.result === 0 ? calculator.value : calculator.result  // result 為 0，尚未計算顯示 value 的陳述，否則顯示 result 的結果
            // result返回一定為字串（區分字符串 "0" 與數值 0）。
            }
          </div>

        </div>
        <div className='keyboard'>
          <input className='keycell allClear'  type="button" value="AC" onClick={() => dispatch(setReset())}/>
          <input className='keycell' type="button" value="%" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="/" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="7" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="8" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="9" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="x" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="4" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="5" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="6" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="-" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="1" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="2" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="3" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="+" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="0" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="." onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell amount' type="button" value="=" onClick={handleCalculate}/>
        </div>
      </div>
      <button  onClick={() => dispatch(setCheck())}>Check</button>
    </>
  )
}

export default App
