import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import { FaChartLine } from "react-icons/fa";
import "./chart.css";
import BASE_URL from "../../../../Pages/config/config";

const EmpTaskChart = (props) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);

  const id = localStorage.getItem("_id");

  useEffect(() => {
    const loadPersonalInfoData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/personal-info/${id}`,
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
      remainingTime = Math.abs(remainingTime);
      return { delay: true, days: 0, hours: 0, minutes: 0 };
    } else {
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
      const response = await axios.get("${BASE_URL}/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      setError("Error fetching tasks. Please try again later.");
    } finally {
      setLoading(false);
      setTimeout(fetchData, 60000);
    }
  };

  useEffect(() => {
    fetchData();

    return () => clearTimeout();
  }, []);

  // Count of different task statuses for the current employee
  const acceptedTasksCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email && taskemp.emptaskStatus === "Accepted"
    )
  ).length;

  const rejectedTasksCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email && taskemp.emptaskStatus === "Rejected"
    )
  ).length;

  const completedTasksCount = tasks.filter(
    (task) =>
      task.status === "Pending" &&
      task.employees.some((emp) => emp.emptaskStatus === "Completed")
  ).length;

  const pendingTasksCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) => taskemp.empemail === email && task.status === "Pending"
    )
  ).length;

  const assignedTasksCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email && taskemp.emptaskStatus === "Task Assigned"
    )
  ).length;

  const acceptedTasksNotCompletedOnTimeCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email &&
        taskemp.emptaskStatus === "Accepted" &&
        calculateRemainingTime(task.endDate).delay
    )
  ).length;

  const completedTasksOnTimeCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email &&
        taskemp.emptaskStatus === "Completed" &&
        !calculateRemainingTime(task.endDate).delay
    )
  ).length;

  const lateCompletedAcceptedTasksCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email &&
        taskemp.emptaskStatus === "Accepted" &&
        calculateRemainingTime(task.endDate).delay
    )
  ).length;

  const lateCompletedTasksCount = tasks.filter((task) =>
    task.employees.some(
      (taskemp) =>
        taskemp.empemail === email &&
        taskemp.emptaskStatus === "Completed" &&
        calculateRemainingTime(task.endDate).delay
    )
  ).length;

  const barChartData = {
    options: {
      chart: {
        id: "bar"
      },
      fill: {
        colors: ["var(--primaryDashColorDark)"]
      },
      xaxis: {
        categories: [
          "New Task",
          "Pending",
          "Accept",
          "Complete",
          "Reject",
          "Overdue",
          "Ontime C",
          "Late C"
        ],
        labels: {
          style: {
            fontSize: "8px"
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "14px"
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bar: {
          columnWidth: "50%"
        }
      }
    },
    series: [
      {
        name: "Total Task",
        data: [
          pendingTasksCount,
          assignedTasksCount,
          acceptedTasksCount,
          completedTasksCount,
          rejectedTasksCount,
          acceptedTasksNotCompletedOnTimeCount,
          completedTasksOnTimeCount,
          lateCompletedAcceptedTasksCount
        ]
      }
    ]
  };

  return (
    <div style={{ height: "fit-content" }} className="ChartCard p-2 pb-0">
      <div className="ChartHeader">
        <h6
          style={{
            width: "fit-content",
            boxShadow: "0 0 10px 1px rgba(0,0,0,.2) inset",
            color: "var(--primaryDashColorDark)"
          }}
          className="fw-bolder d-flex px-3 rounded-5 py-1"
        >
          Task Progress Report
        </h6>
      </div>
      <div className="chartBody">
        <Chart
          options={barChartData.options}
          series={barChartData.series}
          type="bar"
          height="340px"
        />
      </div>
    </div>
  );
};

export default EmpTaskChart;
