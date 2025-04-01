"use client"

import { useState, useEffect } from "react"

const Captcha = ({ onChange }) => {
  const [captchaText, setCaptchaText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [captchaImage, setCaptchaImage] = useState(null)

  // Generate a random captcha with 5 characters
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 5; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(captcha);

    // Create captcha image
    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Add lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add text
    ctx.fillStyle = "#000";
    ctx.font = "bold 24px Arial";
    ctx.fillText(captcha, 30, 35);

    setCaptchaImage(canvas.toDataURL());
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);

    // Check if input matches captcha text
    const isMatch = value === captchaText;
    setIsValid(isMatch);

    // Call the onChange prop with validation result
    onChange(isMatch);
  };

  const refreshCaptcha = () => {
    generateCaptcha();
    setUserInput("");
    setIsValid(false);
    onChange(false);
  };

  return (
    <div className="captcha-container">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="captcha-image border border-gray-300 rounded-md overflow-hidden">
            {captchaImage && <img src={captchaImage || "/placeholder.svg"} alt="CAPTCHA" className="w-full h-auto" />}
          </div>
          <button
            type="button"
            onClick={refreshCaptcha}
            className="ml-2 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
          >
            Làm mới
          </button>
        </div>
        <div className="form-input-container">
          <input
            type="text"
            className="form-input"
            placeholder="Nhập mã CAPTCHA"
            value={userInput}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Captcha;