import React, { useEffect, useState } from 'react';
import { Badge, Row } from 'antd';
import Notification from '../common/Notification';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Container } from 'react-bootstrap';
import { useLocation } from "react-router-dom";
import ApplyDoctor from './ApplyDoctor';
import UserAppointments from './UserAppointments';
import DoctorList from './DoctorList';

const UserHome = () => {
   const [doctors, setDoctors] = useState([]);
   const [userdata, setUserData] = useState(null); // Initialize as null
   const [activeMenuItem, setActiveMenuItem] = useState('');
   

   // Fetch user data from localStorage
   const getUser = () => {
      const user = JSON.parse(localStorage.getItem('userData'));
      if (user) {
         setUserData(user);
      }
   };

   // Fetch user data from backend
   const getUserData = async () => {
      try {
         const res = await axios.post('https://docspot-backend-8jk2.onrender.com/api/user/getuserdata', {}, {
            headers: {
               Authorization: "Bearer " + localStorage.getItem('token'),
            },
         });
         if (res.data.success) {
            setUserData(res.data.data);
         }
      } catch (error) {
         console.error("Error fetching user data:", error);
      }
   };

   // Fetch all doctors
   const getDoctorData = async () => {
      try {
         const res = await axios.get('https://docspot-backend-8jk2.onrender.com/api/user/getalldoctorsu', {
            headers: {
               Authorization: "Bearer " + localStorage.getItem('token'),
            },
         });
         if (res.data.success) {
            setDoctors(res.data.data);
         }
      } catch (error) {
         console.error("Error fetching doctors:", error);
      }
   };

   // Run only on the client side


const location = useLocation();

useEffect(() => {
   getUser();
   getUserData();
   getDoctorData();
}, [location]);


   const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      window.location.href = "/";
   };

   const handleMenuItemClick = (menuItem) => {
      setActiveMenuItem(menuItem);
   };

   if ( !userdata) {
      return <div>Loading...</div>; // Show a loading state while fetching data
   }

   return (
      <div className="main">
         <div className="layout">
            <div className="sidebar">
               <div className="logo">
                  <h2>DocSpot</h2>
               </div>
               <div className="menu">
                  <div
                     className={`menu-items ${activeMenuItem === 'userappointments' ? 'active' : ''}`}
                     onClick={() => handleMenuItemClick('userappointments')}
                  >
                     <CalendarMonthIcon className="icon" />
                     <Link>Appointments</Link>
                  </div>
                  {!userdata.isdoctor && (
                     <div
                        className={`menu-items ${activeMenuItem === 'applyDoctor' ? 'active' : ''}`}
                        onClick={() => handleMenuItemClick('applyDoctor')}
                     >
                        <MedicationIcon className="icon" />
                        <Link>Apply doctor</Link>
                     </div>
                  )}
                  <div className="menu-items" onClick={logout}>
                     <LogoutIcon className="icon" />
                     <Link>Logout</Link>
                  </div>
               </div>
            </div>
            <div className="content">
               <div className="header">
                  <div className="header-content">
                     <Badge
                        className={`notify ${activeMenuItem === 'notification' ? 'active' : ''}`}
                        onClick={() => handleMenuItemClick('notification')}
                        count={userdata?.notification?.length || 0}
                     >
                        <NotificationsIcon className="icon" />
                     </Badge>
                     {userdata.isdoctor && <h3>Dr. </h3>}
                     <h3>{userdata.fullName}</h3>
                  </div>
               </div>
               <div className="body">
                  {activeMenuItem === 'applyDoctor' && <ApplyDoctor userId={userdata._id} />}
                  {activeMenuItem === 'notification' && <Notification />}
                  {activeMenuItem === 'userappointments' && <UserAppointments />}
                  {!['applyDoctor', 'notification', 'userappointments'].includes(activeMenuItem) && (
                     <Container>
                        <h2 className="text-center p-2">Home</h2>
                        {!userdata.isdoctor && (
                           <Row>
                              {doctors.map((doctor, i) => (
                                 <DoctorList userDoctorId={doctor.userId} doctor={doctor} userdata={userdata} key={i} />
                              ))}
                           </Row>
                        )}
                     </Container>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default UserHome;
