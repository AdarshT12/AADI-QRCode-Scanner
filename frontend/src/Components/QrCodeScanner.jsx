import React, { useState } from "react";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { GrPowerReset } from "react-icons/gr";
import "./QRScanner.css";
import { useNavigate } from "react-router-dom";

const CLIENT_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN;

function QRScanner() {
  const [scanResult, setScanResult] = useState("");
  const [response, setResponse] = useState(null);
  const [helpLink, setHelpLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleResult = (result, err) => {
    if (result) {
      setScanResult(result?.text);
      setResponse(null);
    }
    if (err && err.name) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setResponse({ type: "error", message: "Please grant permission to scan QR codes." });
      } else if (err.name === "NotFoundError") {
        setResponse({ type: "error", message: "No camera detected." });
      } else if (err.name === "NotReadableError") {
        setResponse({ type: "error", message: "Camera is in use by another app." });
      }
    }
  };

  const captureData = async () => {
    if (scanResult) {
      setIsProcessing(true);
      try {
        const res = await fetch(`${CLIENT_ORIGIN}/qr-scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: scanResult }),
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          navigate(`/member/${data.member.transactionId}`, { state: data.member });
        } else {
          setResponse({ type: "error", message: data.message || "No matching member found." });
        }
      } catch {
        setResponse({ type: "error", message: "Unable to scan the QR code." });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const resetCapture = () => {
    setScanResult("");
    setResponse(null);
    setHelpLink("");
  };

  return (
    <div className="qrscanner-wrapper">
      <div className="qrscanner-container">
        <div className="qrscanner-box">
          <div className="qr-reader">
            <QrReader
              constraints={{ facingMode: { ideal: "environment" } }}
              onResult={handleResult}
              containerStyle={{ width: "100%", height: "350px" }}
              videoContainerStyle={{ width: "100%", height: "100%" }}
              videoStyle={{ width: "100%", height: "100%", objectFit: "cover", background: "transparent" }}
              scanDelay={100}
            />
          </div>

          <div className="scan-button">
            <button onClick={captureData} disabled={isProcessing}>
              <span>{isProcessing ? "Processing..." : "Capture QR Code"}</span>
              <MdOutlineQrCodeScanner className="qr-icon" />
            </button>
            <button onClick={resetCapture} className="reset-btn">
              <GrPowerReset className="reset-icon" />
            </button>
          </div>
        </div>
      </div>

      {response && (
        <div className={`message ${response.type}`} aria-live="polite">
          <span>{response.message}</span>
          {helpLink && <a href={helpLink} target="_blank" rel="noopener noreferrer">Enable camera access</a>}
        </div>
      )}
    </div>
  );
}

export default QRScanner;
