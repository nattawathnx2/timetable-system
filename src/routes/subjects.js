const express = require("express");
const router = express.Router();
const { requireAuth , requireAdmin , validateId } = require("../middleware/auth");
const pool = require("../db/connection");

router.get("/", requireAuth, async (req,res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM subjects ORDER BY subject_id"
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
            "SELECT * FROM subjects WHERE subject_id = $1", [req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Subjects not found "});
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
            subject_code,
            subject_name,
            credits,
            hours_per_week
        } = req.body;

        if(!subject_code || !subject_name || !credits || !hours_per_week){
            return res.status(400).json({
                error: "subject_code, subject_name and credits are required"
            });
        }

        const result = await pool.query(
            `
            UPDATE subjects
            SET subject_code = $1, subject_name = $2, credits = $3, hours_per_week = $4
            WHERE subject_id = $5
            RETURNING *
            `,
            [
                subject_code,
                subject_name,
                credits,
                hours_per_week,
                req.params.id
            ]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Subjects not found" });
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
            subject_code,
            subject_name,
            credits,
            hours_per_week
        } = req.body;

        if(!subject_code || !subject_name || !credits || !hours_per_week){
            return res.status(400).json({
                error: "subject_code, subject_name and credits are required"
            });
        }
        
        const result = await pool.query(
            `
            INSERT INTO subjects
            (subject_code, subject_name, credits, hours_per_week)
            VALUES ($1,$2,$3,$4)
            RETURNING *
            `,
            [
                subject_code,
                subject_name,
                credits,
                hours_per_week
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

router.delete("/:id", requireAdmin, validateId, async (req,res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM subjects
            WHERE subject_id = $1
            RETURNING *
            `,[req.params.id]
        )
        if(result.rows.length === 0){
            return res.status(404).json({ error: "Subjects not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

module.exports = router;