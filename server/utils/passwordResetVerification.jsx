import React from "react";
import { Button, Img } from "@react-email/components";

const PasswordResetVerification = ({ link, fname }) => {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9f9f9",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
      }}
    >
      <header
        style={{
          textAlign: "center",
          backgroundColor: "#4c8bf5",
          padding: "20px",
          borderTopLeftRadius: "5px",
          borderTopRightRadius: "5px",
        }}
      >
       
       <Img
            src="https://cdn-icons-png.flaticon.com/128/780/780623.png"
            width="50"
            height="50"
            style={{ margin: "auto" }}
          />
        <h3
            style={{
              textAlign: "center",
              color: "white", // Updated text color
              fontFamily: "monospace",
              margin: "10px 0",
            }}
          >
            Password reset
          </h3>
      </header>

      <p style={{ fontSize: "15px", marginTop: "20px" }}>
        Dear {fname},
      </p>

      <p style={{ fontSize: "14px" }}>
        We received a request to reset your password for your account.
      </p>

      <p style={{ fontSize: "14px" }}>
        To reset your password, click on the following link:
      </p>

      <Button
        href={link}
        style={{
          display: "inline-block",
          width: "200px",
          padding: "5px 5px",
          textAlign: "center",
          backgroundColor: "#d4fafa",
          color: "black",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          textDecoration: "none",
          border: "solid 1px black",
        }}
      >
        Reset Password
      </Button>

      <p style={{ fontSize: "14px" }}>
        Please note that this link will expire in 1 hour for security reasons.
      </p>

      <p style={{ fontSize: "14px" }}>
        If you're unable to click the link, you can copy and paste it into your
        web browser's address bar:{" "}
        <a href={link} style={{ color: "#4c8bf5", marginLeft: "5px" }}>
          {link}
        </a>
      </p>

      <p style={{ fontSize: "14px" }}>
        If you did not create an account with tasky.app, please ignore this
        email.
      </p>

      <div>
        <h3>Regards</h3>
        <h3>team @ tasky.app</h3>
      </div>

      <footer
        style={{
          textAlign: "center",
          backgroundColor: "#d4fafa",
          padding: "10px",
          color: "black",
          marginTop: "20px",
        }}
      >
        &copy; 2023-24 TASKY.APP All rights reserved.
      </footer>
    </div>
  );
};

export default PasswordResetVerification;