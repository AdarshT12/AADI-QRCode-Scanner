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
    if (!!result) {
      setScanResult(result?.text);
      setResponse(null);
    }
    if (!!err) {
      if (err.name && err.name.includes("NotFoundException")) return;

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setResponse({ type: "error", message: "Please grant permission to scan QR codes." });
        const ua = navigator.userAgent;
        if (ua.includes("Chrome")) {
          setHelpLink("https://support.google.com/chrome/answer/2693767");
        } else if (ua.includes("Firefox")) {
          setHelpLink("https://support.mozilla.org/en-US/kb/how-manage-your-camera-and-microphone-permissions");
        } else if (ua.includes("Edg")) {
          setHelpLink("https://support.microsoft.com/en-us/microsoft-edge/camera-microphone-and-location-permissions-in-microsoft-edge");
        } else if (ua.includes("Safari")) {
          setHelpLink("https://support.apple.com/guide/safari/manage-camera-settings-ibrw1080/mac");
        }
      } else if (err.name === "NotFoundError") {
        setResponse({ type: "error", message: "No camera detected. Please connect a camera to continue." });
      } else if (err.name === "NotReadableError") {
        setResponse({ type: "error", message: "The camera is currently in use by another application." });
      } else {
        setResponse({ type: "error", message: "Something went wrong. Please try again later." });
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
      } catch (err) {
        setResponse({ type: "error", message: "Unable to scan the QR code. Please try again later." });
      } finally {
        setIsProcessing(false);
      }
    } else {
      setResponse({ type: "error", message: "No QR code detected. Please try again later." });
    }
  };

  const resetCapture = () => {
    setTimeout(() => {
      setScanResult("");
      setResponse(null);
      setHelpLink("");
    }, 1000);
  };

  return (
    <div className="qrscanner-wrapper">
      <div className="qrscanner-container">
        <div className="qrscanner-box">
          <div className="qr-reader">
            <QrReader
              constraints={{ facingMode: "environment" }}
              onResult={handleResult}
              style={{ width: "100%" }}
            />
          </div>

          <div className="scan-button">
            <button onClick={captureData} disabled={isProcessing} aria-disabled={isProcessing}>
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
          {helpLink && (
            <a href={helpLink} target="_blank" rel="noopener noreferrer">
              Enable camera access
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default QRScanner;
