const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
// const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 3000;
const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const MONGO_URI = process.env.MONGODB_URI;

app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/services", (req, res) => {
    res.send("Services page is under construction")
})

app.get("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

// MongoDB connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

// Mongoose Schema
const Schema = mongoose.Schema;

const dataSchema = new Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
});

const Data = mongoose.model("message", dataSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

//form submission
app.post("/submit", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Save data to MongoDB
    const newData = new Data({ name, email, subject, message });
    await newData.save();

    // Email content
    const mailOptions = {
      from: EMAIL, // Sender address
      to: "akonsmith1989@gmail.com", // Receiver's email address (the user's email)
      subject: "Data Submitted Successfully",
      text: `Hi ${name},\n\nA new data has been successfully submitted. Here are the details:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}\n\nThank you for reaching out!\n\nBest Regards,\nBRR Softwares Systems Private Limited`,
    };

    // Send email using Nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).send("Data saved and email sent successfully.");
    console.log("Data saved and email sent.");
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("An error occurred.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
