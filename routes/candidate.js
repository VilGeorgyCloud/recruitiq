const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

// GET all candidates
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, r.name AS recruiterName
       FROM candidate c
       LEFT JOIN recruiter r ON c."recruiterId" = r."recruiterId"
       ORDER BY c."createdAt" DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single candidate
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, r.name AS recruiterName
       FROM candidate c
       LEFT JOIN recruiter r ON c."recruiterId" = r."recruiterId"
       WHERE c."candidateId" = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create candidate
router.post('/', async (req, res) => {
  const {
    recruiterId, name, phone, email,
    currentCompany, designation, location,
    linkedinLink, referredFrom
  } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO candidate
         ("recruiterId", name, phone, email, "currentCompany",
          designation, location, "linkedinLink", "referredFrom")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [recruiterId, name, phone, email, currentCompany,
       designation, location, linkedinLink, referredFrom]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update candidate
router.put('/:id', async (req, res) => {
  const {
    recruiterId, name, phone, email,
    currentCompany, designation, location,
    linkedinLink, referredFrom
  } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE candidate SET
         "recruiterId"=$1, name=$2, phone=$3, email=$4,
         "currentCompany"=$5, designation=$6, location=$7,
         "linkedinLink"=$8, "referredFrom"=$9, "updatedAt"=NOW()
       WHERE "candidateId"=$10
       RETURNING *`,
      [recruiterId, name, phone, email, currentCompany,
       designation, location, linkedinLink, referredFrom, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE candidate
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM candidate WHERE "candidateId"=$1`, [req.params.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
