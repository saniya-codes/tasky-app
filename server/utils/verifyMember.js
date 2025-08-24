import React from "react";
import { Button, Img } from "@react-email/components";
const MemberEmailVerification = ({
  link,
  fname,
  team
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "700px",
      margin: "0 auto",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
      borderRadius: "5px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("header", {
    style: {
      backgroundColor: "#4c8bf5",
      padding: "20px",
      borderRadius: "5px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Img, {
    src: "https://cdn-icons-png.flaticon.com/128/780/780623.png",
    width: "50",
    height: "50",
    style: {
      margin: "auto"
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      textAlign: "center",
      color: "#ffffff",
      // Updated text color
      fontFamily: "monospace",
      margin: "10px 0"
    }
  }, "member email verification"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "16px"
    }
  }, "Dear ", fname, ","), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "16px"
    }
  }, "You have been added to ", team, " team by your employer! Please click the button below to complete your verification:"), /*#__PURE__*/React.createElement(Button, {
    href: link,
    style: {
      display: "inline-block",
      width: "200px",
      padding: "5px 5px",
      textAlign: "center",
      backgroundColor: "#d4fafa",
      // Updated button color
      color: "black",
      // Updated text color
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      textDecoration: "none",
      border: "solid 1px black"
    }
  }, "Verify Your Email Address"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "16px",
      lineHeight: "1.5"
    }
  }, "If you're unable to click the link, you can copy and paste it into your web browser's address bar:", /*#__PURE__*/React.createElement("a", {
    href: link,
    style: {
      color: "blue",
      marginLeft: "5px"
    }
  }, link)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "16px",
      lineHeight: "1.5"
    }
  }, "If you find this email to be unrelated, please ignore it."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "16px",
      lineHeight: "1.5"
    }
  }, "Regards"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "16px",
      lineHeight: "1.5"
    }
  }, "team @ tasky.app")), /*#__PURE__*/React.createElement("footer", {
    style: {
      textAlign: "center",
      backgroundColor: "#d4fafa",
      // Updated footer background color
      padding: "10px",
      color: "black",
      marginTop: "20px"
    }
  }, "\xA9 2023-24 TASKY.APP All rights reserved."));
};
export default MemberEmailVerification;