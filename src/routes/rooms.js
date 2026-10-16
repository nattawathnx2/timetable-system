const express = require("express");
const router = express.Router();
const { requireAuth , requireAdmin , validateId } = require("../middleware/auth");
const pool = require("../db/connection");

router.get("/", requireAuth, async (req,res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM rooms ORDER BY room_id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database Error"
        });
    }
});

router.get("/:id", requireAuth, validateId, async (req,res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM rooms WHERE room_id = $1", [req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Rooms not found" });
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
            room_code,
            room_name,
            room_type
        } = req.body;

        if(!room_code || !room_name || !room_type){
            return res.status(400).json({
                error: "room_code, room_name and room_type are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO rooms
            (room_code, room_name, room_type)
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [
                room_code,
                room_name,
                room_type
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database Error"
        });
    }
});

router.put("/:id", requireAdmin, validateId, async (req,res) => {
    try {
        const {
            room_code,
            room_name,
            room_type
        } = req.body;

        if(!room_code || !room_name || !room_type){
            return res.status(400).json({ error: "room_code, room_name and room_type are required" });
        }

        const result = await pool.query(
            `
            UPDATE rooms
            SET room_code = $1, room_name = $2, room_type = $3
            WHERE room_id = $4
            RETURNING *
            `,
            [
                room_code,
                room_name,
                room_type,
                req.params.id
            ]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Rooms not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.delete("/:id", requireAdmin, validateId, async (req,res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM rooms
            WHERE room_id = $1
            RETURNING *
            `, [req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Rooms not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

module.exports = router;