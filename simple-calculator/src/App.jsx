import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='container'>
        <div className='displayresult'></div>
        <div className='keyboard'>
          <input className='keycell allClear' type="button" value="AC"/>
          <input className='keycell' type="button" value="%"/>
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
          <input className='keycell amount' type="button" value="="/>
        </div>
      </div>
    </>
  )
}

export default App
