const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

// GET all entries (full join for display)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         ce.*,
         c.name          AS candidateName,
         c.phone, c.email, c."currentCompany", c.designation, c.location,
         c."linkedinLink",
         r.name          AS roleName,
         hc.name         AS companyName,
         s.name          AS statusName,
         rec.name        AS recruiterName
       FROM "candidateEntry" ce
       JOIN candidate     c   ON ce."candidateId"     = c."candidateId"
       JOIN role          r   ON ce."roleId"           = r."roleId"
       JOIN "hiringCompany" hc ON r."hiringCompanyId" = hc."hiringCompanyId"
       JOIN status        s   ON ce."statusId"         = s."statusId"
       LEFT JOIN recruiter rec ON ce."recruiterId"    = rec."recruiterId"
       ORDER BY ce."createdAt" DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single entry
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         ce.*,
         c.name AS candidateName, c.phone, c.email,
         c."currentCompany", c.designation, c.location, c."linkedinLink",
         r.name AS roleName,
         hc.name AS companyName,
         s.name AS statusName,
         rec.name AS recruiterName
       FROM "candidateEntry" ce
       JOIN candidate       c   ON ce."candidateId"     = c."candidateId"
       JOIN role            r   ON ce."roleId"           = r."roleId"
       JOIN "hiringCompany" hc  ON r."hiringCompanyId"  = hc."hiringCompanyId"
       JOIN status          s   ON ce."statusId"         = s."statusId"
       LEFT JOIN recruiter  rec ON ce."recruiterId"     = rec."recruiterId"
       WHERE ce."candidateEntryId" = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      `INSERT INTO "candidateEntry" (
         "candidateId","roleId","statusId","recruiterId",
         "cvLink","cvDate","totalExperience","ctc","ectc","noDays",
         "totalScore","loCDate","loDate","recruiterNotes",
         "r1Datetime","r1Feedback","r2Datetime","r2Feedback",
         "r3Datetime","r3Feedback","finalInterview","finalFeedback"
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
         $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
       ) RETURNING *`,
      [
        candidateId, roleId, statusId, recruiterId,
        cvLink, cvDate, totalExperience, ctc, ectc, noDays,
        totalScore, loCDate, loDate, recruiterNotes,
        r1Datetime, r1Feedback, r2Datetime, r2Feedback,
        r3Datetime, r3Feedback, finalInterview, finalFeedback
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      `UPDATE "candidateEntry" SET
         "statusId"=$1,"recruiterId"=$2,"cvLink"=$3,"cvDate"=$4,
         "totalExperience"=$5,"ctc"=$6,"ectc"=$7,"noDays"=$8,
         "totalScore"=$9,"loCDate"=$10,"loDate"=$11,"recruiterNotes"=$12,
         "r1Datetime"=$13,"r1Feedback"=$14,"r2Datetime"=$15,"r2Feedback"=$16,
         "r3Datetime"=$17,"r3Feedback"=$18,"finalInterview"=$19,
         "finalFeedback"=$20,"updatedAt"=NOW()
       WHERE "candidateEntryId"=$21
       RETURNING *`,
      [
        statusId, recruiterId, cvLink, cvDate,
        totalExperience, ctc, ectc, noDays, totalScore,
        loCDate, loDate, recruiterNotes,
        r1Datetime, r1Feedback, r2Datetime, r2Feedback,
        r3Datetime, r3Feedback, finalInterview, finalFeedback,
        req.params.id
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM "candidateEntry" WHERE "candidateEntryId"=$1`,
      [req.params.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
