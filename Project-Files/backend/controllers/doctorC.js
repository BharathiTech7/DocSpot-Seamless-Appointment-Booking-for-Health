const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");
const userSchema = require("../schemas/userModel");
const mongoose = require("mongoose");

const fs = require("fs");
const path = require('path');
const updateDoctorProfileController = async (req, res) => {
  try {
    console.log("Incoming Payload:", req.body);

    const doctor = await docSchema.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body }, // Update only the fields provided in the body
      { new: true } // Return the updated document
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: doctor,
      message: "Successfully updated profile",
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};
;

const getAllDoctorAppointmentsController = async (req, res) => {
  try {
    // Ensure the request is from an authenticated doctor
    const userId = req.user.id;

    console.log("Incoming User ID:", userId);

    // Find the doctor profile using the authenticated user ID
    const doctor = await docSchema.findOne({ userId });
    console.log("Doctor Found:", doctor);

    if (!doctor) {
      return res.status(404).send({
        message: "Doctor profile not found",
        success: false,
      });
    }

    // Fetch all appointments associated with the doctor's ID
    const allAppointments = await appointmentSchema.find({ doctorId: doctor._id });
    console.log("Appointments Found:", allAppointments);

    return res.status(200).send({
      message: "All the appointments are listed below.",
      success: true,
      data: allAppointments,
    });
  } catch (error) {
    console.error("Error in getAllDoctorAppointmentsController:", error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};


const handleStatusController = async (req, res) => {
  try {
    const { userid, appointmentId, status } = req.body;

    // Update the appointment's status
    const appointment = await appointmentSchema.findOneAndUpdate(
      { _id: appointmentId },
      { status: status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find the user associated with the appointment
    const user = await userSchema.findOne({ _id: userid });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Ensure notifications array exists
    const notification = user.notification || [];
    notification.push({
      type: "status-updated",
      message: `Your appointment has been ${status}`,
    });

    user.notification = notification;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Successfully updated",
    });
  } catch (error) {
    console.error("Error in handleStatusController:", error.message || error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
      error: error.message || error,
    });
  }
};

const documentDownloadController = async (req, res) => {
  try {
    const appointId = req.query.appointId;
    if (!appointId) {
      return res.status(400).send({ message: "Appointment ID is required", success: false });
    }

    const appointment = await appointmentSchema.findById(appointId);

    if (!appointment) {
      return res.status(404).send({ message: "Appointment not found", success: false });
    }

    const documentUrl = appointment.document?.path;

    if (!documentUrl || typeof documentUrl !== "string") {
      return res.status(404).send({ message: "Document URL is invalid", success: false });
    }

    const absoluteFilePath = path.resolve("uploads", path.basename(documentUrl));
console.log("Resolved File Path:", absoluteFilePath);


    fs.access(absoluteFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.log("Constructed File Path:", absoluteFilePath);

        return res.status(404).send({ message: "File not found", success: false });
      }
console.log("Constructed File Path:", absoluteFilePath);

      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(absoluteFilePath)}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      const fileStream = fs.createReadStream(absoluteFilePath);
      fileStream.on("error", (error) => {
        console.error("Error reading file:", error);
        return res.status(500).send({ message: "Error reading the document", success: false });
      });

      fileStream.pipe(res);
    });
  } catch (error) {
    console.log("Constructed File Path:", absoluteFilePath);
    console.error("Error in documentDownloadController:", error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};


module.exports = {
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  documentDownloadController,
};
