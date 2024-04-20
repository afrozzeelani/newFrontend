import React from "react";

const InnerDashContainer = ({ children }) => {
  return (
    <div
      className="py-2"
      style={{
        minHeight: "100vh",
        maxHeight: "100vh",
        width: "100%",
        overflow: "auto"
      }}
    >
      {children}
    </div>
  );
};

export default InnerDashContainer;
