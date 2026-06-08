const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

// ── HIRING COMPANIES ──────────────────────────────────────────

router.get('/companies', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM hiringcompany ORDER BY name ASC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/companies', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO hiringcompany (name) VALUES ($1) RETURNING *`, [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/companies/:id', async (req, res) => {
  const { name, isActive } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE hiringcompany SET name=$1, isactive=$2, updatedat=NOW()
       WHERE hiringcompanyid=$3 RETURNING *`,
      [name, isActive, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM hiringcompany WHERE hiringcompanyid=$1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── ROLES ─────────────────────────────────────────────────────

router.get('/roles', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, hc.name AS companyname
       FROM role r
       JOIN hiringcompany hc ON r.hiringcompanyid = hc.hiringcompanyid
       ORDER BY r.name ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/roles', async (req, res) => {
  const { hiringCompanyId, name, numPositions, jdLink, experienceRequired, location, mandateStatus } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO role (hiringcompanyid, name, numpositions, jdlink, experiencerequired, location, mandatestatus)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [hiringCompanyId, name, numPositions || 1, jdLink, experienceRequired, location, mandateStatus || 'ACTIVE']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/roles/:id', async (req, res) => {
  const { name, numPositions, jdLink, experienceRequired, location, mandateStatus } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE role SET name=$1, numpositions=$2, jdlink=$3,
         experiencerequired=$4, location=$5, mandatestatus=$6, updatedat=NOW()
       WHERE roleid=$7 RETURNING *`,
      [name, numPositions, jdLink, experienceRequired, location, mandateStatus, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM role WHERE roleid=$1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── RECRUITERS ────────────────────────────────────────────────

router.get('/recruiters', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM recruiter WHERE isactive=true ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/recruiters', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO recruiter (name, email) VALUES ($1,$2) RETURNING *`, [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── STATUSES ──────────────────────────────────────────────────

router.get('/statuses', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM status ORDER BY statusid ASC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/statuses', async (req, res) => {
  const { name, isNumber } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO status (name, isnumber) VALUES ($1,$2) RETURNING *`, [name, isNumber || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── STATS ─────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [candidates, entries, roles, companies] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM candidate`),
      pool.query(`SELECT COUNT(*) FROM candidateentry`),
      pool.query(`SELECT COUNT(*) FROM role WHERE mandatestatus='ACTIVE'`),
      pool.query(`SELECT COUNT(*) FROM hiringcompany WHERE isactive=true`),
    ]);
    res.json({
      candidates:  parseInt(candidates.rows[0].count),
      entries:     parseInt(entries.rows[0].count),
      roles:       parseInt(roles.rows[0].count),
      companies:   parseInt(companies.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── OFFERS ────────────────────────────────────────────────────

router.get('/offers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,
         c.name AS candidatename,
         r.name AS rolename,
         hc.name AS companyname
       FROM offer o
       JOIN candidateentry ce ON o.candidateentryid = ce.candidateentryid
       JOIN candidate c ON ce.candidateid = c.candidateid
       JOIN role r ON ce.roleid = r.roleid
       JOIN hiringcompany hc ON r.hiringcompanyid = hc.hiringcompanyid
       ORDER BY o.createdat DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/offers', async (req, res) => {
  const { candidateEntryId, offeredCtc, date, acceptanceDeadline, joiningDate, noticePeriod, invoiceId, isSent, hasAccepted } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO offer (candidateentryid, offeredctc, date, acceptancedeadline, joiningdate, noticeperiod, invoiceid, issent, hasaccepted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [candidateEntryId, offeredCtc, date, acceptanceDeadline, joiningDate, noticePeriod, invoiceId, isSent||false, hasAccepted||false]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/offers/:id', async (req, res) => {
  const { offeredCtc, date, acceptanceDeadline, joiningDate, noticePeriod, invoiceId, isSent, hasAccepted } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE offer SET offeredctc=$1, date=$2, acceptancedeadline=$3, joiningdate=$4,
         noticeperiod=$5, invoiceid=$6, issent=$7, hasaccepted=$8, updatedat=NOW()
       WHERE offerid=$9 RETURNING *`,
      [offeredCtc, date, acceptanceDeadline, joiningDate, noticePeriod, invoiceId, isSent||false, hasAccepted||false, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/offers/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM offer WHERE offerid=$1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
