const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  documentDownloadController,
   getDoctorDashboardController,
} = require("../controllers/doctorC");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/updateprofile", authMiddleware, updateDoctorProfileController);

router.get(
  "/getdoctorappointments",
  authMiddleware,
  getAllDoctorAppointmentsController
);

router.post("/handlestatus", authMiddleware, handleStatusController);

router.get(
  "/getdocumentdownload",
  authMiddleware,
  documentDownloadController
);

router.get("/dashboard", authMiddleware, getDoctorDashboardController);


module.exports = router;
