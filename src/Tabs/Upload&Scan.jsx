import React from "react";
import FileUploader from "../Components/FileUpload";
import "./Upload&Scan.css";
import QRScanner from "../Components/QrCodeScanner";

function UploadAndScanTab({ isAdmin }) {
  return (
    <div className="upload-scan-container">
      {isAdmin && <FileUploader />}
      <QRScanner />
    </div>
  );
}

export default UploadAndScanTab;