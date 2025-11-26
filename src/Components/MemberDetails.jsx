import { useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import "./MemberDetails.css";
import Correct from "../assets/Correct.jpeg";

function MemberDetails() {
  const { state: member } = useLocation();
  const navigate = useNavigate();

  if (!member) return <p>No member data available.</p>;

  return (
    <div className="member-details-container">
      <div className="image-container">
        <img src={Correct} alt="Logo" className="member-details-logo" />
      </div>
      <div className="id-card">
        <div className="id-card-header">
          <h2>Member Details</h2>
        </div>
        <div className="id-card-body">
          <CgProfile className="profile-icon" />
          <p><strong>Name:</strong> {member.Full_Name}</p>
          <p><strong>Event:</strong> {member.event}</p>
          <p><strong>Event Details:</strong> {member.eventDetails}</p>
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
