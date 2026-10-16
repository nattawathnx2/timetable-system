const express = require("express");
const router = express.Router();
const { requireAuth , requireAdmin, validateId } = require("../middleware/auth");
const pool = require('../db/connection');

router.get("/", requireAuth, async (req,res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM teachers ORDER BY teacher_id"
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
            `
            SELECT * FROM teachers WHERE teacher_id = $1
            `, [req.params.id]
        )

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error "});
    }
});

router.post("/", requireAdmin, async (req,res) => {
    try {
        const {
            teacher_code,
            first_name,
            last_name,
            department
        } = req.body;
        if(!teacher_code || !first_name || !last_name || !department){
            return res.status(400).json({
                error: "teacher_code, first_name, last_name and department are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO teachers
            (teacher_code, first_name, last_name, department)
            VALUES ($1,$2,$3,$4)
            RETURNING *
            `,
            [
                teacher_code,
                first_name,
                last_name,
                department
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
            teacher_code,
            first_name,
            last_name,
            department
        } = req.body;

        if(!teacher_code || !first_name || !last_name || !department){
            return res.status(400).json({
                error: "teacher_code, first_name, last_name and department are required"
            });
        }

        const result = await pool.query(
            `
            UPDATE teachers 
            SET teacher_code = $1, first_name = $2, last_name = $3, department = $4
            WHERE teacher_id = $5
            RETURNING *
            `,
            [
                teacher_code,
                first_name,
                last_name,
                department,
                req.params.id
            ]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error "});
    }
});

router.delete("/:id", requireAdmin, validateId, async (req,res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM teachers
            WHERE teacher_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error : "Teacher not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

module.exports = router;