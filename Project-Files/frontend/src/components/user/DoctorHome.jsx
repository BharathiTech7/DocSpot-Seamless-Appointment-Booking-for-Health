import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "antd";

const DoctorHome = ({ userdata }) => {
  const [appointments, setAppointments] = useState([]);
  const [upcoming, setUpcoming] = useState(null);

  const getDoctorAppointments = async () => {
    try {
      const res = await axios.get(
        "https://docspot-backend-8jk2.onrender.com/api/doctor/getDoctorAppointments",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        const apps = res.data.data;
        setAppointments(apps);

        // Filter upcoming based on date
        const futureApps = apps.filter(
          (a) => new Date(a.date) >= new Date()
        );

        if (futureApps.length) {
          const nextApp = futureApps.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          )[0];

          setUpcoming(nextApp);
        }
      }
    } catch (error) {
      console.log("Error fetching Doctor Appointments:", error);
    }
  };

  useEffect(() => {
    getDoctorAppointments();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Welcome Dr. {userdata?.fullName} 👨‍⚕️
      </h2>

      <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
        <Card title="Total Appointments" style={{ width: 200 }}>
          <h3>{appointments.length}</h3>
        </Card>

        <Card title="Pending" style={{ width: 200 }}>
          <h3>
            {appointments.filter((app) => app.status === "pending").length}
          </h3>
        </Card>
      </div>

      {upcoming && (
        <Card title="Upcoming Appointment" style={{ marginTop: "20px" }}>
          <p><b>Patient:</b> {upcoming.patientName}</p>
          <p><b>Date:</b> {new Date(upcoming.date).toLocaleString()}</p>
        </Card>
      )}

      <Card title="Your Profile" style={{ marginTop: "20px" }}>
        <p><b>Specialization:</b> {userdata.specialization}</p>
        <p><b>Experience:</b> {userdata.experience} years</p>
        <p><b>Clinic/Hospital:</b> {userdata.address}</p>
      </Card>
    </div>
  );
};

export default DoctorHome;
