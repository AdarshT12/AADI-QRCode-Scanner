import { useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import "./MemberDetails.css";
import Correct from "../assets/Correct.png";

function MemberDetails() {
  const { state: member } = useLocation();
  const navigate = useNavigate();

  if (!member) return <p>No member data available.</p>;

  const getEventDetails = (eventName) => {
    if (!eventName) return "Dates are not available";

    const name = eventName.toLowerCase(); 

    switch (name) {
      case "masterclass":
        return "14th December 2025";
      case "hands-on workshop - botulinum toxin - a upper face indications":
      case "hands-on workshop - skin booster hands-on - ⁠canula and needle techniques":
      case "hands-on workshop - both":
        return "13th & 14th December 2025";
      case "masterclass with single hands-on workshop":
      case "masterclass with both hands-on workshops":
        return "13th & 14th December 2025";
      default:
        return "Dates are not available";
    }
  };

  return (
    <div className="member-details-container">
      <div className="image-container">
        <img src={Correct} alt="Logo" className="member-details-logo" />
      </div>
      <div className="id-card">
        <div className="id-card-header">
          <h2>Member Details</h2>
        </div>
        <div className="id-card-body" aria-live="polite">
          <CgProfile className="profile-icon" />
          <p><strong>Name:</strong> {member.Full_Name}</p>
          <p><strong>Email:</strong> {member.Email}</p>
          <p><strong>Phone:</strong> {member.Phone_Number}</p>
          <p><strong>Event:</strong> {member.event}</p>
          <p><strong>Date:</strong> {getEventDetails(member.event)}</p>
        </div>
      </div>

      <button
        className="back-button"
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default MemberDetails;
