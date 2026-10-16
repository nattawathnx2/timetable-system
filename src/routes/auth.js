const express = require('express');
const router = express.Router();
const pool = require("../db/connection");
const bcrypt = require("bcrypt");

router.post("/login", async (req,res) => {
    try {
        const {username,password} = req.body;

        const result = await pool.query(
            `
            SELECT * FROM users WHERE username = $1
            `,
            [username]
        );

        if(result.rows.length === 0){
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );
        if(!isMatch){
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        req.session.regenerate((err) => {
            if(err){
                console.error(err);
                return res.status(500).json({ error: "Session Error" });
            }

            req.session.user = {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            }

            req.session.save((err) => {
                if(err){
                    console.error(err);
                    return res.status(500).json({ error: "Session Error" });
                }

                res.json({
                    message: "Login successful",
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        role: user.role
                    }
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});


router.post("/logout", async (req,res) => {
    if(!req.session){
        return res.status(401).json({
            error: "Not Logged In"
        });
    }

    req.session.destroy((err) => {
        if(err){
            console.error(err);
            return res.status(500).json({
                error: "Logout Failed"
            });
        }

        res.clearCookie("connect.sid");
        return res.json({
            message: "Logout successful"
        });
    });
});

module.exports = router;