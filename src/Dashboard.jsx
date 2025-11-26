import React, { useEffect, useState } from 'react';
import Logo from "./assets/AADILogo.jpg";
import { FaUserCircle } from "react-icons/fa";
import { IoMdArrowDropdown, IoIosLogOut } from "react-icons/io";
import "./Dashboard.css";
import UploadAndScanTab from './Tabs/Upload&Scan';
import AddUserForm from './Tabs/AddUser.jsx';
import Footer from './Components/Footer.jsx';

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [secureData, setSecureData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("UploadAndScan");

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        console.log("Auth /me response:", data);
        setMe(data);
      });
  }, []);

  async function loadSecure() {
    const res = await fetch('http://localhost:5000/api/secure/data', { credentials: 'include' });
    const json = await res.json();
    setSecureData(json);
  }

  function handleLogout() {
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      window.location.href = "/";
    });
  }

  return (
    <>
      <div className="dashboard-container">
        <div className='dashboardHeader'>
          <div className="logo-icon"><img src={Logo} alt="Logo" /></div>

          <div className="profile-menu">
            <button className="profile-button" onClick={() => setShowMenu(!showMenu)}>
              <FaUserCircle className="profile-icon" />
              <h3 className='profile-name'>Hello {Boolean(me?.user?.isAdmin) ? "Admin" : me?.user?.name || ""}</h3>
              <IoMdArrowDropdown className="arrow-icon" />
            </button>

            {showMenu && (
              <div className="dropdown" onClick={handleLogout}>
                <IoIosLogOut className='Logout-icon' />
                <span className='logout-text' >Logout</span>
              </div>
            )}
          </div>
        </div>
        <div className="dashboard-tabs">
          <div className="tab-header">
            <button className={activeTab === "UploadAndScan" ? "active" : ""} onClick={() => setActiveTab("UploadAndScan")}>
              Upload & Scan
            </button>
            {Boolean(me?.user?.isAdmin) && (
              <button
                className={activeTab === "AddUser" ? "active" : ""}
                onClick={() => setActiveTab("AddUser")}
              >
                Add User
              </button>
            )}
          </div>

          <div className="tab-content">
            {activeTab === "UploadAndScan" && <UploadAndScanTab isAdmin={me?.user?.isAdmin === 1}/>}
            {me?.user?.isAdmin === 1  && activeTab === "AddUser" && <AddUserForm />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
