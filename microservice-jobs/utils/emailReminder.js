import React from "react";
import { Img } from "@react-email/components";
const TaskReminderEmail = ({
  fname,
  taskname,
  deadline
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "700px",
      margin: "0 auto",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
      borderRadius: "5px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      textAlign: "center",
      backgroundColor: "#4c8bf5",
      padding: "20px",
      borderTopLeftRadius: "5px",
      borderTopRightRadius: "5px"
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
      color: "white",
      // Updated text color
      fontFamily: "monospace",
      margin: "10px 0"
    }
  }, "Reminder email!")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "15px",
      marginTop: "20px"
    }
  }, "Dear ", fname, ","), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "14px"
    }
  }, "I hope this email finds you well. This is an automatic friendly reminder about completing your task \"", taskname, "\" !!. As the deadline approaches, it's essential to ensure everything is on track."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "14px"
    }
  }, "Please be sure to note the final deadline for this task on ", deadline, "."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Regards"), /*#__PURE__*/React.createElement("h3", null, "team @ tasky.app")), /*#__PURE__*/React.createElement("footer", {
    style: {
      textAlign: "center",
      backgroundColor: "#d4fafa",
      padding: "10px",
      color: "black",
      marginTop: "20px"
    }
  }, "\xA9 2023-24 TASKY.APP All rights reserved."));
};
export default TaskReminderEmail;