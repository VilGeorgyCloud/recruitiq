const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

// ── HIRING COMPANIES ──────────────────────────────────────────

router.get('/companies', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM "hiringCompany" ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/companies', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO "hiringCompany" (name) VALUES ($1) RETURNING *`,
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/companies/:id', async (req, res) => {
  const { name, isActive } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE "hiringCompany" SET name=$1, "isActive"=$2, "updatedAt"=NOW()
       WHERE "hiringCompanyId"=$3 RETURNING *`,
      [name, isActive, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM "hiringCompany" WHERE "hiringCompanyId"=$1`,
      [req.params.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── ROLES ─────────────────────────────────────────────────────

router.get('/roles', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, hc.name AS companyName
       FROM role r
       JOIN "hiringCompany" hc ON r."hiringCompanyId" = hc."hiringCompanyId"
       ORDER BY r.name ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/roles', async (req, res) => {
  const {
    hiringCompanyId, name, numPositions,
    jdLink, experienceRequired, location, mandateStatus
  } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO role
         ("hiringCompanyId", name, "numPositions", "jdLink",
          "experienceRequired", location, "mandateStatus")
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [hiringCompanyId, name, numPositions || 1,
       jdLink, experienceRequired, location, mandateStatus || 'ACTIVE']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/roles/:id', async (req, res) => {
  const {
    name, numPositions, jdLink,
    experienceRequired, location, mandateStatus
  } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE role SET
         name=$1, "numPositions"=$2, "jdLink"=$3,
         "experienceRequired"=$4, location=$5, "mandateStatus"=$6,
         "updatedAt"=NOW()
       WHERE "roleId"=$7 RETURNING *`,
      [name, numPositions, jdLink,
       experienceRequired, location, mandateStatus, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM role WHERE "roleId"=$1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── RECRUITERS ────────────────────────────────────────────────

router.get('/recruiters', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM recruiter WHERE "isActive"=true ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/recruiters', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO recruiter (name, email) VALUES ($1,$2) RETURNING *`,
      [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── STATUSES ──────────────────────────────────────────────────

router.get('/statuses', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM status ORDER BY "statusId" ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/statuses', async (req, res) => {
  const { name, isNumber } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO status (name, "isNumber") VALUES ($1,$2) RETURNING *`,
      [name, isNumber || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── STATS (for homepage counters) ─────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [candidates, entries, roles, companies] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM candidate`),
      pool.query(`SELECT COUNT(*) FROM "candidateEntry"`),
      pool.query(`SELECT COUNT(*) FROM role WHERE "mandateStatus"='ACTIVE'`),
      pool.query(`SELECT COUNT(*) FROM "hiringCompany" WHERE "isActive"=true`),
    ]);
    res.json({
      candidates:  parseInt(candidates.rows[0].count),
      entries:     parseInt(entries.rows[0].count),
      roles:       parseInt(roles.rows[0].count),
      companies:   parseInt(companies.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
