const express = require('express');
const app = express();
const session = require("express-session");

const teacherRoutes = require("./routes/teachers");
const subjectRoutes = require("./routes/subjects");
const roomRoutes = require("./routes/rooms");
const groupRoutes = require("./routes/student-groups");
const schedulesRoutes = require("./routes/schedules");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "dev-only-change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 *60 * 2
    }
}));
app.use(express.static("public"));

app.use("/teachers", teacherRoutes);
app.use("/subjects", subjectRoutes);
app.use("/rooms", roomRoutes);
app.use("/student-groups", groupRoutes);
app.use("/schedules", schedulesRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server runnning at port ${PORT}`);
});