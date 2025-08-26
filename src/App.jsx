import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Login'
import './login.css'
import Signup from './Signup'
import './Signup.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Headder from './Headder'
import './Headder.css'
import UserPage from './UserPage'
import AdmiPage from './AdminPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />      
        <Route path="/signup" element={<Signup/>}/>
        <Route path='/userPage' element={<UserPage/>}/>
        <Route path='/adminpage' element={<AdmiPage/>}/>
      </Routes>
    </Router>
    {/* <Headder/> */}
    </>
  )
}

export default App
