import React from "react";
import { Img } from "@react-email/components";

const TaskReminderEmail = ({ fname, taskname, deadline }) => {
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
            Reminder email!
          </h3>
      </header>

      <p style={{ fontSize: "15px", marginTop: "20px" }}>
        Dear {fname},
      </p>

      <p style={{ fontSize: "14px" }}>
        I hope this email finds you well. This is an automatic friendly reminder about completing your task "{taskname}" !!. As the deadline approaches, it's essential to ensure everything is on track.
      </p>

      <p style={{ fontSize: "14px" }}>
        Please be sure to note the final deadline for this task on {deadline}.
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

export default TaskReminderEmail;