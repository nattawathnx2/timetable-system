const express = require("express");
const router = express.Router();
const { requireAuth , requireAdmin } = require("../middleware/auth");
const pool = require("../db/connection");

router.get("/", requireAuth, async (req,res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM student_groups ORDER BY group_id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error "});
    }
});

router.get("/:id", requireAuth, async (req,res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM student_groups WHERE group_id = $1",[req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Student-Group not found"});
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error "});
    }
});

router.post("/", requireAdmin, async (req,res) => {
    try {
        const {
            group_code,
            group_name,
            academic_year,
            student_count
        } = req.body;

        if(!group_code || !group_name || !academic_year || !student_count){
            return res.status(400).json({ error: "group_code, group_name, academic_year and student_count are required" });
        }

        const result = await pool.query(
            `
            INSERT INTO student_groups
            (group_code, group_name, academic_year, student_count)
            VALUES ($1,$2,$3,$4)
            RETURNING *
            `,
            [
                group_code,
                group_name,
                academic_year,
                student_count
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.put("/:id", requireAdmin, async (req,res) => {
    try {
        const {
            group_code,
            group_name,
            academic_year,
            student_count
        } = req.body;

        if(!group_code || !group_name || !academic_year || !student_count){
            return res.status(400).json({ error: "group_code, group_name, academic_year and student_count are required" });
        }

        const result = await pool.query(
            `
            UPDATE student_groups
            SET group_code = $1, group_name = $2, academic_year = $3, student_count = $4
            WHERE group_id = $5
            RETURNING *
            `,
            [
                group_code,
                group_name,
                academic_year,
                student_count,
                req.params.id
            ]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Student-Group not found"});
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.delete("/:id", requireAdmin, async (req,res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM student_groups
            WHERE group_id = $1
            RETURNING *
            `, [req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Student-Group not found"});
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error "});
    }
});

module.exports = router;