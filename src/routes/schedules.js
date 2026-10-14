const express = require("express");
const router = express.Router();
const { requireAuth , requireAdmin } = require("../middleware/auth");
const pool = require("../db/connection");

router.get("/", requireAuth, async (req,res) => {
    try {
        const teacherId = req.query.teacher_id;
        const subjectId = req.query.subject_id;
        const roomId = req.query.room_id;
        const groupId = req.query.group_id;
        console.log(teacherId, subjectId, roomId, groupId);
        
        let sql = `
            SELECT 
                s.schedule_id, s.day_of_week, s.start_time, s.end_time,
                s.teacher_id, s.subject_id, s.room_id, s.group_id,
                t.teacher_code, t.first_name, t.last_name,
                sub.subject_name,
                r.room_name,
                g.group_name
            FROM schedules s
            JOIN teachers t
                ON s.teacher_id = t.teacher_id
            JOIN subjects sub
                ON s.subject_id = sub.subject_id
            JOIN rooms r
                ON s.room_id = r.room_id
            JOIN student_groups g
                ON s.group_id = g.group_id
            WHERE 1=1
        `;

        const values = [];
        let paramIndex = 1;

        if(teacherId){
            sql += ` AND s.teacher_id = $${paramIndex}`;
            values.push(teacherId);
            paramIndex++;
        }

        if(subjectId){
            sql += ` AND s.subject_id = $${paramIndex}`;
            values.push(subjectId);
            paramIndex++;
        }

        if(roomId){
            sql += ` AND s.room_id = $${paramIndex}`;
            values.push(roomId);
            paramIndex++;
        }

        if(groupId){
            sql += ` AND s.group_id = $${paramIndex}`;
            values.push(groupId);
            paramIndex++;
        }

        sql += ` ORDER BY s.schedule_id`;
        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

router.get("/:id", requireAuth, async (req,res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                s.schedule_id, s.day_of_week, s.start_time, s.end_time,
                s.teacher_id, s.subject_id, s.room_id, s.group_id,
                t.teacher_code, t.first_name, t.last_name,
                sub.subject_name,
                r.room_name,
                g.group_name
            FROM schedules s
            JOIN teachers t
                ON s.teacher_id = t.teacher_id
            JOIN subjects sub
                ON s.subject_id = sub.subject_id
            JOIN rooms r
                ON s.room_id = r.room_id
            JOIN student_groups g
                ON s.group_id = g.group_id
            WHERE s.schedule_id = $1
            `,[req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: "Schedules not found" });
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
            DELETE FROM schedules
            WHERE schedule_id = $1
            RETURNING *
            `, [req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: "Schedules not found" });
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
            day_of_week,
            start_time,
            end_time,
            teacher_id,
            subject_id,
            room_id,
            group_id
        } = req.body;

        if(!day_of_week || !start_time || !end_time || !teacher_id || !subject_id || !room_id || !group_id){
            return res.status(400).json({
                error: "The information received is incomplete!"
            });
        }

        if(start_time >= end_time){
            return res.status(400).json({
                error: "End time must be later than start time"
            });
        }

        const teacherConflict = await pool.query(
            `
            SELECT *
            FROM schedules
            WHERE day_of_week = $1
            AND teacher_id = $2
            AND start_time < $3
            AND end_time > $4
            `,
            [
                day_of_week,
                teacher_id,
                end_time,
                start_time
            ]
        );

        if(teacherConflict.rows.length > 0){
            return res.status(400).json({
                error: "Teacher already has a class at this time"
            })
        }

        const roomConflict = await pool.query(
            `
            SELECT *
            FROM schedules
            WHERE day_of_week = $1
            AND room_id = $2
            AND start_time < $3
            AND end_time > $4
            `,
            [
                day_of_week,
                room_id,
                end_time,
                start_time
            ]
        );

        if(roomConflict.rows.length > 0){
            return res.status(400).json({
                error: "Room already has a class at this time"
            });
        }

        const groupConflict = await pool.query(
            `
            SELECT *
            FROM schedules
            WHERE day_of_week = $1
            AND group_id = $2
            AND start_time < $3
            AND end_time > $4
            `,
            [
                day_of_week,
                group_id,
                end_time,
                start_time
            ]
        );

        if(groupConflict.rows.length > 0){
            return res.status(400).json({
                error: "Group already has a class at this time"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO schedules
            (day_of_week, start_time, end_time, teacher_id, subject_id, room_id, group_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [
                day_of_week,
                start_time,
                end_time,
                teacher_id,
                subject_id,
                room_id,
                group_id
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
            day_of_week,
            start_time,
            end_time,
            teacher_id,
            subject_id,
            room_id,
            group_id
        } = req.body;

        if(!day_of_week || !start_time || !end_time || !teacher_id || !subject_id || !room_id || !group_id){
            return res.status(400).json({
                error: "The information received is incomplete!"
            });
        }

        if(start_time >= end_time){
            return res.status(400).json({
                error: "End time must be later than start time"
            });
        }

        const teacherConflict = await pool.query(
            `
            SELECT *
            FROM schedules
            WHERE day_of_week = $1
            AND teacher_id = $2
            AND start_time < $3
            AND end_time > $4
            AND schedule_id != $5
            `,
            [
                day_of_week,
                teacher_id,
                end_time,
                start_time,
                req.params.id
            ]
        );

        if(teacherConflict.rows.length > 0){
            return res.status(400).json({
                error: "Teacher already has a class at this time"
            })
        }

        const roomConflict = await pool.query(
            `
            SELECT *
            FROM schedules
            WHERE day_of_week = $1
            AND room_id = $2
            AND start_time < $3
            AND end_time > $4
            AND schedule_id != $5
            `,
            [
                day_of_week,
                room_id,
                end_time,
                start_time,
                req.params.id
            ]
        );

        if(roomConflict.rows.length > 0){
            return res.status(400).json({
                error: "Room already has a class at this time"
            });
        }

        const groupConflict = await pool.query(
            `
            SELECT *
            FROM schedules
            WHERE day_of_week = $1
            AND group_id = $2
            AND start_time < $3
            AND end_time > $4
            AND schedule_id != $5
            `,
            [
                day_of_week,
                group_id,
                end_time,
                start_time,
                req.params.id
            ]
        );

        if(groupConflict.rows.length > 0){
            return res.status(400).json({
                error: "Group already has a class at this time"
            });
        }

        const result = await pool.query(
            `
            UPDATE schedules
            SET 
                day_of_week = $1,
                start_time = $2,
                end_time = $3,
                teacher_id = $4,
                subject_id = $5,
                room_id = $6,
                group_id = $7
            WHERE schedule_id = $8
            RETURNING *
            `, [day_of_week, start_time, end_time, teacher_id, subject_id, room_id, group_id, req.params.id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Schedules not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
});

module.exports = router;