const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

// GET all entries
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ce.*,
         c.name AS candidatename, c.phone, c.email,
         c.currentcompany, c.designation, c.location, c.linkedinlink,
         r.name AS rolename,
         hc.name AS companyname,
         s.name AS statusname,
         rec.name AS recruitername
       FROM candidateentry ce
       JOIN candidate c ON ce.candidateid = c.candidateid
       JOIN role r ON ce.roleid = r.roleid
       JOIN hiringcompany hc ON r.hiringcompanyid = hc.hiringcompanyid
       JOIN status s ON ce.statusid = s.statusid
       LEFT JOIN recruiter rec ON ce.recruiterid = rec.recruiterid
       ORDER BY ce.createdat DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single entry
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ce.*,
         c.name AS candidatename, c.phone, c.email,
         c.currentcompany, c.designation, c.location, c.linkedinlink,
         r.name AS rolename,
         hc.name AS companyname,
         s.name AS statusname,
         rec.name AS recruitername
       FROM candidateentry ce
       JOIN candidate c ON ce.candidateid = c.candidateid
       JOIN role r ON ce.roleid = r.roleid
       JOIN hiringcompany hc ON r.hiringcompanyid = hc.hiringcompanyid
       JOIN status s ON ce.statusid = s.statusid
       LEFT JOIN recruiter rec ON ce.recruiterid = rec.recruiterid
       WHERE ce.candidateentryid = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create entry
router.post('/', async (req, res) => {
  const {
    candidateId, roleId, statusId, recruiterId,
    cvLink, cvDate, totalExperience, ctc, ectc, noDays,
    totalScore, loCDate, loDate, recruiterNotes,
    r1Datetime, r1Feedback, r2Datetime, r2Feedback,
    r3Datetime, r3Feedback, finalInterview, finalFeedback
  } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO candidateentry (
         candidateid, roleid, statusid, recruiterid,
         cvlink, cvdate, totalexperience, ctc, ectc, nodays,
         totalscore, locdate, lodate, recruiternotes,
         r1datetime, r1feedback, r2datetime, r2feedback,
         r3datetime, r3feedback, finalinterview, finalfeedback
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [candidateId, roleId, statusId, recruiterId,
       cvLink, cvDate, totalExperience, ctc, ectc, noDays,
       totalScore, loCDate, loDate, recruiterNotes,
       r1Datetime, r1Feedback, r2Datetime, r2Feedback,
       r3Datetime, r3Feedback, finalInterview, finalFeedback]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update entry
router.put('/:id', async (req, res) => {
  const {
    statusId, recruiterId, cvLink, cvDate,
    totalExperience, ctc, ectc, noDays, totalScore,
    loCDate, loDate, recruiterNotes,
    r1Datetime, r1Feedback, r2Datetime, r2Feedback,
    r3Datetime, r3Feedback, finalInterview, finalFeedback
  } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE candidateentry SET
         statusid=$1, recruiterid=$2, cvlink=$3, cvdate=$4,
         totalexperience=$5, ctc=$6, ectc=$7, nodays=$8,
         totalscore=$9, locdate=$10, lodate=$11, recruiternotes=$12,
         r1datetime=$13, r1feedback=$14, r2datetime=$15, r2feedback=$16,
         r3datetime=$17, r3feedback=$18, finalinterview=$19,
         finalfeedback=$20, updatedat=NOW()
       WHERE candidateentryid=$21 RETURNING *`,
      [statusId, recruiterId, cvLink, cvDate,
       totalExperience, ctc, ectc, noDays, totalScore,
       loCDate, loDate, recruiterNotes,
       r1Datetime, r1Feedback, r2Datetime, r2Feedback,
       r3Datetime, r3Feedback, finalInterview, finalFeedback,
       req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM candidateentry WHERE candidateentryid=$1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
