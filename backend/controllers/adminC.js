const docSchema = require("../schemas/docModel");
const userSchema = require("../schemas/userModel");
const appointmentSchema = require("../schemas/appointmentModel");
const getAllUsersControllers = async (req, res) => {
  try {
    const users = await userSchema.find({});
    return res.status(200).send({
      message: "Users data list",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({});

    return res.status(200).send({
      message: "doctor Users data list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console
      .log(error)
      .status(500)
      .send({ message: "something went wrong", success: false });
  }
};

const getStatusApproveController = async (req, res) => {
  try {
    const { doctorId, status, userid } = req.body;
    
    // Log the incoming request data
    console.log("Request Body:", req.body);

    const doctor = await docSchema.findOneAndUpdate(
      { _id: doctorId },
      { status }
    );

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
        success: false,
      });
    }

    const user = await userSchema.findOne({ _id: userid });

    // Check if user exists
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    const notification = user.notification;
    notification.push({
      type: "doctor-account-approved",
      message: `Your Doctor account has ${status}`,
      onClickPath: "/notification",
    });

    user.isdoctor = status === "approved" ? true : false;
    await user.save();
    await doctor.save();

    return res.status(201).send({
      message: "Successfully updated approve status of the doctor!",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};


const getStatusRejectController = async (req, res) => {
  try {
    const { doctorId, status, userid } = req.body;

    // Update doctor status
    const doctor = await docSchema.findOneAndUpdate(
      { _id: doctorId },
      { status },
      { new: true } // Return the updated document
    );

    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
        success: false,
      });
    }

    // Update user 'isdoctor' field if status is 'rejected'
    const user = await userSchema.findOneAndUpdate(
      { _id: userid },
      { isdoctor: status !== "rejected" }, // Set isdoctor to false if rejected
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    // Add a notification to the user's notification array
    user.notification.push({
      type: "doctor-account-status-update", // General type for status updates
      message: `Your Doctor account has been ${status}`,
      onClickPath: "/notification",
    });

    await user.save();

    console.log("Updated User:", user);
    console.log("Updated Doctor:", doctor);

    return res.status(201).send({
      message: `Successfully updated ${status} status of the doctor!`,
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Error in getStatusRejectController:", error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};


const displayAllAppointmentController = async (req, res) => {
  try {
    const allAppointments = await appointmentSchema.find();
      return res.status(200).send({
        success: true,
        message: "successfully fetched All Appointments ",
        data: allAppointments,
      });
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

module.exports = {
  getAllDoctorsControllers,
  getAllUsersControllers,
  getStatusApproveController,
  getStatusRejectController,
  displayAllAppointmentController,
};
