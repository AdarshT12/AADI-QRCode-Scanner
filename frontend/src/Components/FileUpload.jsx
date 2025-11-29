import React, { useState, useRef } from "react";
import "./FileUpload.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdCancel, MdCheckCircle } from "react-icons/md";

const CLIENT_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN;

function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [response, setResponse] = useState(null); 
  const xhrRef = useRef(null);
  const timeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const clearMessages = () => {
    setTimeout(() => {
      setResponse(null);
      setProgress(0);
    }, 5000);
  };

  const uploadFile = (file) => {
    if (!file || !/\.(xls|xlsx|csv)$/i.test(file.name)) {
      setResponse({
        type: "error",
        message: "Only Excel or CSV files (.xls, .xlsx, .csv) are allowed. Please choose a valid file."
      });
      clearMessages();
      return;
    }

    setIsUploading(true);
    setResponse(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        setResponse({ type: "success", message: "Upload completed successfully!" });
        clearMessages();
      } else {
        setResponse({ type: "error", message: "Upload unsuccessful. Please try again later." });
        clearMessages();
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setResponse({ type: "error", message: "Upload unsuccessful due to a network issue. Please check your connection and try again." });
      clearMessages();
    };

    xhr.onabort = () => {
      setIsUploading(false);
      setResponse({ type: "error", message: "The upload was canceled before completion. Please try again later." });
      clearMessages();
    };

    xhr.open("POST", `${CLIENT_ORIGIN}/upload`, true);
    xhr.withCredentials = true;

    timeoutRef.current = setTimeout(() => {
      xhr.send(formData);
      timeoutRef.current = null;
    }, 3000);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    uploadFile(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    uploadFile(file);
  };

  const handleAbort = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsUploading(false);
      setResponse({ type: "error", message: "The upload was canceled before it began. Please try again later." });
      clearMessages();
      return;
    }
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  return (
    <div
      className={`upload-container ${isUploading ? "disabled" : ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="upload-box" onClick={() => !isUploading && fileInputRef.current.click()}   aria-disabled={isUploading}>
        <div className="upload-icon-box">
          <IoCloudUploadOutline className="upload-icon" />
        </div>
        <p className="upload-text">
          <span className="clickable">Click to upload</span> or drag and drop
        </p>
        <p className="upload-hint">Only .xls, .xlsx, or .csv files. Max size: 10MB</p>
        <input
          type="file"
          accept=".xls,.xlsx,.csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          disabled={isUploading} 
        />
      </div>

      {isUploading && (
        <div className="upload-status">
          <progress value={progress} max="100"></progress>
          <button className="abort-btn" onClick={handleAbort}>
            <MdCancel /> Cancel
          </button>
        </div>
      )}

      {/* Unified response block */}
      {response && (
        <div className={`message ${response.type}`} aria-live="polite">
          {response.type === "success" && <MdCheckCircle className="success-icon" />}
          <span>{response.message}</span>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
