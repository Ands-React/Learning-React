import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useSelector, useDispatch} from 'react-redux'
import { setCheck, setTarget } from './features/calculatorSlice' // Added setTarget

function App() {
  const calculator = useSelector(state => state.calculator)
  const dispatch = useDispatch()

  return (
    <>
      <div className='container'>
        <div className='displayresult'>{calculator.value}</div>
        <div className='keyboard'>
          <input className='keycell allClear' type="button" value="AC"/>
          <input className='keycell' type="button" value="%" onClick={(e) => dispatch(setTarget(e.target.value))}/>
          <input className='keycell' type="button" value="/"/>
          <input className='keycell' type="button" value="7"/>
          <input className='keycell' type="button" value="8"/>
          <input className='keycell' type="button" value="9"/>
          <input className='keycell' type="button" value="X"/>
          <input className='keycell' type="button" value="4"/>
          <input className='keycell' type="button" value="5"/>
          <input className='keycell' type="button" value="6"/>
          <input className='keycell' type="button" value="-"/>
          <input className='keycell' type="button" value="1"/>
          <input className='keycell' type="button" value="2"/>
          <input className='keycell' type="button" value="3"/>
          <input className='keycell' type="button" value="+"/>
          <input className='keycell' type="button" value="0"/>
          <input className='keycell' type="button" value="."/>
          <input className='keycell amount' type="button" value="=" onClick={() => dispatch(setCheck())}/>
        </div>
      </div>
    </>
  )
}

export default App
