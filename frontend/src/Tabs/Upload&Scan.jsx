import React, { useEffect } from "react";
import FileUploader from "../Components/FileUpload";
import "./Upload&Scan.css";
import QRScanner from "../Components/QrCodeScanner";

function UploadAndScanTab({ isAdmin }) {
  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("admin-padding");
    } else {
      document.body.classList.remove("admin-padding");
    }

    return () => {
      document.body.classList.remove("admin-padding");
    };
  }, [isAdmin]);
  return (
    <div className="upload-scan-container" aria-live="polite" role="region" aria-label="Upload and Scan Section">
      {isAdmin && <FileUploader />}
      <QRScanner />
    </div>
  );
}

export default UploadAndScanTab;