import React, { useEffect, useState, useContext } from "react";

import { AttendanceContext } from "../../../Context/AttendanceContext/AttendanceContext";
import axios from "axios";
import BASE_URL from "../../../Pages/config/config";
const NoticeBoard = () => {
  const [notice, setNotice] = useState([]);
  const { socket } = useContext(AttendanceContext);
  const id = localStorage.getItem("_id");
  const loadEmployeeData = () => {
    axios
      .get(`${BASE_URL}/api/particularEmployee/${id}`, {
        headers: {
          authorization: localStorage.getItem("token") || ""
        }
      })
      .then((response) => {
        console.log(response.data.Notice);
        setNotice(response.data.Notice);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    loadEmployeeData();
  }, []);
  useEffect(() => {
    console.log("Socket:", socket?.id);
    if (socket) {
      socket.on("notice", (data) => {
        setNotice((prev) => [data, ...prev]);
      });
      socket.on("noticeDelete", (data) => {
        if (data) {
          loadEmployeeData();
        }
      });
    }
  }, [socket]);
  const pdfHandler = (val) => {
    console.log(val);
    window.open(`${BASE_URL}/${val.attachments}`, "_blank", "noreferrer");
    // window.open(path, "_blank")
  };

  return (
    <div className="container box-shadow: 0 4px 10px 0 rgb(137 137 137 / 25%); mt-4 ">
      <div className="birthday">
        <h4 className="fw-bolder d-flex text-muted gap-0 text-center">
          Notice Board{" "}
          <span className="text-primary mx-2">
            (
            {
              notice.filter(
                (val, i, ar) =>
                  ar.findIndex((item) => item.noticeId === val.noticeId) === i
              ).length
            }
            )
          </span>
        </h4>
        <div
          className="mainbirth"
          style={{ maxWidth: "100%", overflowX: "auto" }}
        >
          {notice.filter(
            (val, i, ar) =>
              ar.findIndex((item) => item.noticeId === val.noticeId) === i
          ).length > 0 ? (
            <table className="table table-striped mt-3">
              <thead>
                <tr>
                  <th className="cursor-pointer" style={{ width: "100%" }}>
                    Notice
                  </th>
                </tr>
              </thead>
              <tbody>
                {notice
                  .filter(
                    (val, i, ar) =>
                      ar.findIndex((item) => item.noticeId === val.noticeId) ===
                      i
                  )
                  .map((val) => (
                    <tr key={val.noticeId} style={{ cursor: "pointer" }}>
                      <td onClick={() => pdfHandler(val)}>{`${val.notice}`}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No Notice</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
