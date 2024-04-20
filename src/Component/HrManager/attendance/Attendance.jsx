import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AttendanceContext } from "../../../Context/AttendanceContext/AttendanceContext";
import Moment from "moment";
import SelfAttendance from "./SelfAttendance";
import BASE_URL from "../../../Pages/config/config";
function Attendance(props) {
  const [empName, setEmpName] = useState(null);

  const {
    employees,
    setEmployees,
    selectedEmployee,
    setSelectedEmployee,
    attencenceID,
    setAttencenceID,
    message,
    setMessage
  } = useContext(AttendanceContext);

  useEffect(() => {
    const loadEmployeeData = async (email) => {
      await axios
        .get(`${BASE_URL}/api/employee`, {
          headers: {
            authorization: localStorage.getItem("token") || ""
          }
        })
        .then((response) => {
          // Ensure that response.data is an array
          let hr = response.data.filter((val) => {
            return val.Account === 2;
          });
          setEmployees(hr);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    loadEmployeeData();
  }, []);
  // hello

  useEffect(() => {
    const loadPersonalInfoData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/personal-info/` + localStorage.getItem("_id"),
          {
            headers: {
              authorization: localStorage.getItem("token") || ""
            }
          }
        );
        console.log(response.data.FirstName);
        setEmpName(response.data.FirstName);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    loadPersonalInfoData();
  }, []);

  // hello
  const handleUserChange = (employeeID) => {
    const selectedEmployee = employees.find(
      (employee) => employee._id === employeeID
    );

    if (selectedEmployee) {
      setAttencenceID(selectedEmployee.attendanceObjID);
      setSelectedEmployee(employeeID);
      getMessage(employeeID);
    }
  };

  const getMessage = async (employeeID) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/attendance/${employeeID}`
      );
      const lastEntry = response.data[response.data.length - 1];

      if (lastEntry) {
        setMessage(`Status: ${lastEntry.years[0].months[0].dates[0].status}`);
      } else {
        setMessage("");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const handleLogin = async () => {
    let data = employees.filter((val) => {
      return val.FirstName === empName;
      // console.log(val.FirstName, empName);
    });
    console.log(data);
    let attencenceID = data[0].attendanceObjID;
    let selectedEmployee = data[0]._id;

    try {
      if (!empName) {
        setMessage("Please select a user");
        return;
      }
      const currentTimeMs = Math.round(new Date().getTime() / 1000 / 60);

      const currentTime = Moment().format("LT");
      await axios.post(`${BASE_URL}/api/attendance/${attencenceID}`, {
        employeeId: selectedEmployee,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: new Date().getDate(),
        loginTime: [currentTime],
        loginTimeMs: [currentTimeMs],
        status: "Login"
      });
      setMessage("Login time recorded successfully");
    } catch (error) {
      console.error("Error recording login time:", error);
      setMessage("Error recording login time");
    }
  };

  const handleLogout = async () => {
    let data = employees.filter((val) => {
      return val.FirstName === empName;
    });
    let attencenceID = data[0].attendanceObjID;
    let selectedEmployee = data[0]._id;
    try {
      if (!empName) {
        setMessage("Please select an employee");
        return;
      }
      const currentTimeMs = Math.round(new Date().getTime() / 1000 / 60);

      const currentTime = Moment().format("HH:mm:ss");
      await axios.post(`${BASE_URL}/api/attendance/${attencenceID}`, {
        employeeId: selectedEmployee,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: new Date().getDate(),
        logoutTime: [currentTime],
        logoutTimeMs: [currentTimeMs],
        status: "Logout"
      });
      setMessage("Logout time recorded successfully");
    } catch (error) {
      console.error("Error recording logout time:", error);
      setMessage("Error recording logout time");
    }
  };

  const handleResume = async () => {
    let email = localStorage.getItem("Email");
    if (employees) {
      let data = employees.filter((val) => {
        return val.Email === email;
      });
      let attencenceID = data[0].attendanceObjID;
      let selectedEmployee = data[0]._id;
      try {
        if (!data) {
          setMessage("Please select an employee");
          return;
        }

        const currentTime = Moment().format("HH:mm:ss");
        const URcurrentTimeMs = new Date().getTime();
        const currentTimeMs = Math.round(URcurrentTimeMs);

        await axios.post(`${BASE_URL}/api/attendance/${attencenceID}`, {
          employeeId: selectedEmployee,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          date: new Date().getDate(),
          ResumeTime: [currentTime],
          resumeTimeMS: [currentTimeMs],
          status: "Login"
        });

        setMessage("Resumed time recorded successfully");
      } catch (error) {
        console.error("Error recording resume time:", error);
        setMessage("Error recording resume time");
      }
    }
  };

  const handleBreak = async () => {
    let email = localStorage.getItem("Email");
    if (employees) {
      let data = employees.filter((val) => {
        return val.Email === email;
      });
      console.log(email);
      let attencenceID = data[0].attendanceObjID;
      let selectedEmployee = data[0]._id;
      try {
        if (!data) {
          setMessage("Please select an employee");
          return;
        }

        const currentTime = Moment().format("HH:mm:ss");
        const URcurrentTimeMs = new Date().getTime();
        const currentTimeMs = Math.round(URcurrentTimeMs);

        await axios.post(`${BASE_URL}/api/attendance/${attencenceID}`, {
          employeeId: selectedEmployee,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          date: new Date().getDate(),
          breakTime: [currentTime],
          breakTimeMs: [currentTimeMs],
          status: "Break"
        });
        setMessage("Break time recorded successfully");
      } catch (error) {
        console.error("Error recording break time:", error);
        setMessage("Error recording break time");
      }
    }
  };

  console.log(employees);

  return (
    <div className="App row">
      <h1 className="text-center text-uppercase my-3">Attendance System</h1>
      <div
        className="form-control d-flex  gap-3 p-3 m-3"
        style={{ height: "fit-content" }}
      >
        <input value={empName} style={{ display: "none" }} />

        <div className="d-flex gap-3">
          <button className="btn btn-success" onClick={handleLogin}>
            Mark Attendance
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
          <div className="d-flex gap-3">
            <button className="btn btn-warning" onClick={handleBreak}>
              Break
            </button>
            <button className="btn btn-primary" onClick={handleResume}>
              Resume
            </button>
          </div>
        </div>
      </div>

      {message && <p>{message}</p>}

      <div className="view">
        <SelfAttendance />
      </div>
    </div>
  );
}

export default Attendance;
