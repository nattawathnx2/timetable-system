const express = require("express");
const router = express.Router();
const pool = require("../db/connection");
const { requireAuth , requireAdmin, validateId } = require("../middleware/auth");
const bcrypt = require("bcrypt");

router.get("/auth/admin-check", requireAuth, requireAdmin, (req,res) => {
    res.json({ authorized: true });
});

router.get("/", requireAuth, requireAdmin, async (req,res) => {
    try {
        const result = await pool.query(
            `
            SELECT user_id, username, role, created_at
            FROM users ORDER BY user_id
            `
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database Error"
        });
    }
});

router.get("/:id", requireAuth, requireAdmin,  validateId, async (req,res) => {
    try {
        const result = await pool.query(
            `
            SELECT user_id, username, role, created_at
            FROM users WHERE user_id = $1
            `,[req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "user not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.post("/", requireAdmin, async (req,res) => {
    try {
        const {
            username,
            password,
            role
        } = req.body;

        if(!username || !password || !role){
            return res.status(400).json({ error: "username, password and role are required" });
        }

        const hashPassword = await bcrypt.hash(password ,10);
        const result = await pool.query(
            `
            INSERT INTO users
            (username, password_hash, role)
            VALUES($1,$2,$3)
            RETURNING *
            `,
            [
                username,
                hashPassword,
                role
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.delete("/:id", requireAdmin, validateId, async (req,res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM users
            WHERE user_id = $1
            RETURNING *
            `,[req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: "user not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.put("/:id", requireAdmin, validateId, async (req,res) => {
    try {
        const {
            username,
            password,
            role
        } = req.body;

        if(!username || !role){
            return res.status(400).json({ error: "username and role are required" });
        }
        
        let result;
        if(!password){
            result = await pool.query(
                `
                UPDATE users
                SET username = $1, role = $2
                WHERE user_id = $3
                RETURNING *
                `   ,
                [
                    username,
                    role,
                    req.params.id
                ]
            );
        }else{
            const hashPassword = await bcrypt.hash(password ,10);
            result = await pool.query(
                `
                UPDATE users
                SET username = $1, password_hash = $2, role = $3
                WHERE user_id = $4
                RETURNING *
                `   ,
                [
                    username,
                    hashPassword,
                    role,
                    req.params.id
                ]
            );
        }

        if(result.rows.length === 0){
            return res.status(404).json({ error: "user not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

module.exports = router;