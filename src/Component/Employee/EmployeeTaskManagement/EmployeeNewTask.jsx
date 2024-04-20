import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Table from "react-bootstrap/Table";
import { BsFiletypeDoc } from "react-icons/bs";
import { AttendanceContext } from "../../../Context/AttendanceContext/AttendanceContext";
import BASE_URL from "../../../Pages/config/config";
import { v4 as uuid } from "uuid";

const EmployeeNewTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState(null);
  const empMail = localStorage.getItem("Email");
  const taskId = uuid();
  const { socket } = useContext(AttendanceContext);

  const id = localStorage.getItem("_id");
  // console.log(id)
  useEffect(() => {
    const loadPersonalInfoData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/personal-info/` + id,
          {
            headers: {
              authorization: localStorage.getItem("token") || ""
            }
          }
        );
        setEmail(response.data.Email);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    loadPersonalInfoData();
  }, []);

  const calculateRemainingTime = (endDate) => {
    const now = new Date();
    const endDateTime = new Date(endDate);
    let remainingTime = endDateTime - now;

    if (remainingTime < 0) {
      // If remaining time is negative, consider it as delay
      remainingTime = Math.abs(remainingTime);
      return { delay: true, days: 0, hours: 0, minutes: 0 };
    } else {
      // Calculate remaining days, hours, minutes, and seconds
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      return { delay: false, days, hours, minutes };
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      setError("Error fetching tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

  }, []);

  const acceptTask = async (taskId, empEmail, task) => {
    try {
      const empRemarks = prompt("Enter remarks for accepting the task:");

      if (empRemarks === null) {
        return; // If the user clicks Cancel in the prompt, do nothing
      }

      await axios.put(`${BASE_URL}/api/tasks/${taskId}/employees/${empEmail}`, {
        emptaskStatus: "Accepted",
        empTaskComment: empRemarks
      });

      toast.success("Task accepted successfully!");
      const employeeNotificationArr = task.employees.map((val) => {
        if (val.emptaskStatus !== "Rejected" && val.empemail !== email) {
          return val.empemail;
        }
      });
      const employeeTaskNotification = {
        senderMail: empMail,
        employeesEmail: [...employeeNotificationArr, task.managerEmail],
        taskId,
        status: "unseen",
        taskName: task.Taskname,
        message: `${task.Taskname} is Accepted by ${empMail}`,
        taskStatus: "Accepted",
        Account: 3,
        path: "activeTask"
      };

      socket.emit("employeeTaskUpdateNotification", employeeTaskNotification);
      // Update the UI by fetching the latest tasks
      fetchData();
    } catch (error) {
      console.error("Error accepting task:", error.message);
      toast.error("Failed to accept task. Please try again.");
    }
  };

  const rejectTask = async (taskId, empEmail, task) => {
    try {
      const empRemarks = prompt("Enter remarks for rejecting the task:");

      if (empRemarks === null) {
        return; // If the user clicks Cancel in the prompt, do nothing
      }

      await axios.put(`${BASE_URL}/api/tasks/${taskId}/employees/${empEmail}`, {
        emptaskStatus: "Rejected",
        empTaskComment: empRemarks
      });

      toast.success("Task rejected successfully!");
      const employeeTaskNotification = {
        senderMail: empMail,
        employeesEmail: [task.managerEmail],
        taskId,
        status: "unseen",
        taskName: task.Taskname,
        message: `${task.Taskname} is Rejected by ${empMail}`,
        taskStatus: "Rejected",
        Account: 3,
        path: "activeTask"
      };
      console.log(employeeTaskNotification);
      socket.emit("employeeTaskUpdateNotification", employeeTaskNotification);
      // Update the UI by fetching the latest tasks
      fetchData();
    } catch (error) {
      console.error("Error rejecting task:", error.message);
      toast.error("Failed to reject task. Please try again.");
    }
  };

  const completeTask = async (taskId, empEmail, task) => {
    try {
      const empRemarks = prompt("Enter remarks for complete the task:");

      if (empRemarks === null) {
        return; // If the user clicks Cancel in the prompt, do nothing
      }

      await axios.put(`${BASE_URL}/api/tasks/${taskId}/employees/${empEmail}`, {
        emptaskStatus: "Completed",
        empTaskComment: empRemarks
      });

      toast.success("Task Completed successfully!");
      const employeeNotificationArr = task.employees.map((val) => {
        if (val.emptaskStatus !== "Rejected" && val.empemail !== email) {
          return val.empemail;
        }
      });
      const employeeTaskNotification = {
        senderMail: empMail,
        employeesEmail: [...employeeNotificationArr, task.managerEmail],
        taskId,
        status: "unseen",
        taskName: task.Taskname,
        taskStatus: "Completed",
        message: `${task.Taskname} is Completed by ${empMail}`,
        Account: 3,
        path: "activeTask"
      };
      console.log(employeeTaskNotification);
      socket.emit("employeeTaskUpdateNotification", employeeTaskNotification);
      // Update the UI by fetching the latest tasks
      fetchData();
    } catch (error) {
      console.error("Error Completing task:", error.message);
      toast.error("Failed to Complete task. Please try again.");
    }
  };

  const totalTaskAssigned = tasks.filter((task) =>
    task.employees.some((taskemp) => taskemp.emptaskStatus === "Task Assigned")
  ).length;

  console.log("Total Task Assigned: ", totalTaskAssigned);

  return (
    <div>
      <h1 className="fs-3 fw-bolder text-uppercase ">🌟New Task ({}) </h1>

      {loading && (
        <div
          style={{ width: "100%", height: "100%" }}
          className="d-flex aline-center gap-2"
        >
          <div
            className="spinner-grow bg-primary"
            style={{ width: "1rem", height: "1rem" }}
            role="status"
          ></div>

          <span className="text-primary fw-bold">Loading...</span>
        </div>
      )}
      {error && <p className="text-danger">{error}</p>}
      <div
        style={{
          overflowY: "scroll",
          height: "80vh",
          scrollbarWidth: "thin",
          scrollbarGutter: "stable",
          scrollMargin: "1rem"
        }}
      >
        {email &&
          tasks
            .filter(
              (task) =>
                task.status === "Pending" &&
                task.employees.some((taskemp) => taskemp.empemail === email)
            )
            .reverse()
            .map((task, index) => (
              <details
                style={{
                  boxShadow: "-1px 1px 10px gray"
                }}
                className="p-1 position-relative mt-3 fs-4 rounded mx-3"
                key={task.id}
              >
                <summary
                  style={{ height: "fit-content" }}
                  className="d-flex justify-content-between aline-center form-control bg-danger "
                >
                  <div className="fw-bold fs-5 d-flex justify-content-center flex-column">
                    # Task {index + 1} : {task.Taskname}
                  </div>
                  <div
                    style={{ position: "absolute", top: "-10px", left: "20px" }}
                    className="fw-bold bg-white rounded-5 px-3 text-primary fs-6 d-flex justify-content-center aline-center flex-column"
                  >
                    {task.department}
                  </div>
                  <div className="d-flex gap-2 RemainingTimeHandel justify-content-between ">
                    {calculateRemainingTime(task.endDate).delay ? (
                      <div>
                        <div className="text-center d-none">
                          <div className="form-control  fw-bold p-0">
                            {calculateRemainingTime(task.endDate).days}{" "}
                          </div>{" "}
                          <div>Day</div>
                        </div>
                        <h5 className="btn btn-danger p-1 px-3 fw-bold">
                          Late
                        </h5>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div
                          style={{ boxShadow: "0 0 5px 2px gray inset" }}
                          className="form-control fw-bold px-1 py-0"
                        >
                          {calculateRemainingTime(task.endDate).days}{" "}
                        </div>{" "}
                        <div>Day</div>
                      </div>
                    )}
                    {calculateRemainingTime(task.endDate).delay ? (
                      <div className="text-center d-none">
                        <div className="form-control  fw-bold p-0">
                          {calculateRemainingTime(task.endDate).hours}{" "}
                        </div>{" "}
                        <div>Min</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div
                          style={{ boxShadow: "0 0 5px 2px gray inset" }}
                          className="form-control fw-bold px-1 py-0"
                        >
                          {calculateRemainingTime(task.endDate).hours}{" "}
                        </div>{" "}
                        <div>Hrs</div>
                      </div>
                    )}
                    {calculateRemainingTime(task.endDate).delay ? (
                      <div className="text-center d-none">
                        <div className="form-control fw-bold p-0">
                          {calculateRemainingTime(task.endDate).minutes}{" "}
                        </div>{" "}
                        <div>Min</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div
                          style={{ boxShadow: "0 0 5px 2px gray inset" }}
                          className="form-control fw-bold px-1 py-0"
                        >
                          {calculateRemainingTime(task.endDate).minutes}{" "}
                        </div>{" "}
                        <div>Min</div>
                      </div>
                    )}
                  </div>
                </summary>
                <div
                  style={{ position: "relative" }}
                  className="row p-1 my-2 mx-0 bg-light text-dark rounded"
                >
                  <div
                    style={{ height: "fit-content" }}
                    className="form-control"
                  >
                    <p
                      style={{ height: "fit-content" }}
                      className="text-start fs-6 form-control"
                    >
                      <h6 className="fw-bold">Task Discription</h6>{" "}
                      {task.description}
                    </p>
                    <div
                      style={{ height: "fit-content" }}
                      className="row form-control d-flex pt-3 rounded mx-1 justify-content-between"
                    >
                      <p
                        style={{ fontSize: "1rem" }}
                        className="col-6 col-sm-6 col-md-2"
                      >
                        <b>Task Durations</b> <br />{" "}
                        <span>{task.duration} days</span>{" "}
                      </p>
                      <p
                        style={{ fontSize: "1rem" }}
                        className="col-6 col-sm-6 col-md-2"
                      >
                        <b> Manager</b> <br /> <span>{task.managerEmail}</span>
                      </p>
                      <p
                        style={{ fontSize: "1rem" }}
                        className="col-6 col-sm-6 col-md-2"
                      >
                        <b>Start Date</b> <br />{" "}
                        <span>
                          {new Date(task.startDate).toLocaleDateString()}
                        </span>
                      </p>
                      <p
                        style={{ fontSize: "1rem" }}
                        className="col-6 col-sm-6 col-md-2"
                      >
                        <b>End Date</b> <br />{" "}
                        <span>
                          {new Date(task.endDate).toLocaleDateString()}
                        </span>
                      </p>
                      <p
                        style={{ fontSize: "1rem" }}
                        className="col-6 col-sm-6 col-md-2"
                      >
                        <span>
                          <b>Task Status</b> <br /> {task.status}
                        </span>
                      </p>
                    </div>
                    <div
                      style={{ height: "fit-content" }}
                      className="row form-control d-flex my-1 pt-3 rounded mx-1 justify-content-between"
                    >
                      <h6 className="fw-bold">Project Members</h6>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th className="bg-dark text-white">S. No</th>
                            <th className="bg-dark text-white">Name</th>
                            <th className="bg-dark text-white">Email</th>
                            <th className="bg-dark text-white">Designation</th>
                            <th className="bg-dark text-white">Action</th>
                            <th className="bg-dark text-white">Task Status</th>
                            <th className="bg-dark text-white">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {email &&
                            task.employees
                              .filter((taskemp) => taskemp.empemail === email)
                              .map((taskemp, i) => (
                                <tr key={i}>
                                  <td>{i + 1}</td>
                                  <td>{taskemp.empname}</td>
                                  <td>{taskemp.empemail}</td>
                                  <td>{taskemp.empdesignation}</td>
                                  <td className="row justify-content-center gap-2 ">
                                    <button
                                      className="btn col-3 btn-primary py-1"
                                      onClick={() =>
                                        acceptTask(
                                          task._id,
                                          taskemp.empemail,
                                          task
                                        )
                                      }
                                      disabled={
                                        taskemp.emptaskStatus === "Accepted" ||
                                        taskemp.emptaskStatus === "Rejected" ||
                                        taskemp.emptaskStatus === "Completed"
                                      }
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="btn col-3 py-1 btn-danger"
                                      onClick={() =>
                                        rejectTask(
                                          task._id,
                                          taskemp.empemail,
                                          task
                                        )
                                      }
                                      disabled={
                                        taskemp.emptaskStatus === "Accepted" ||
                                        taskemp.emptaskStatus === "Rejected" ||
                                        taskemp.emptaskStatus === "Completed"
                                      }
                                    >
                                      Reject
                                    </button>
                                    <button
                                      className="btn col-3 py-1 btn-success"
                                      onClick={() =>
                                        completeTask(
                                          task._id,
                                          taskemp.empemail,
                                          task
                                        )
                                      }
                                      disabled={
                                        taskemp.emptaskStatus === "Completed"
                                      }
                                    >
                                      Complete
                                    </button>

                                    <button className="btn col-3 btn-info py-1">
                                      <BsFiletypeDoc /> View Docs
                                    </button>
                                  </td>
                                  <td>{taskemp.emptaskStatus} </td>
                                  <td
                                    style={{
                                      maxWidth: "10rem",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {taskemp.empTaskComment}
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </details>
            ))}
      </div>
    </div>
  );
};

export default EmployeeNewTask;
