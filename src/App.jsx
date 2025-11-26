import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Login from './Login.jsx';
import Dashboard from "./Dashboard.jsx";
import MemberDetails from "./Components/MemberDetails.jsx";

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/member/:transactionId" element={<MemberDetails />} />
        </Routes>       
    </>
  )
}

export default App
