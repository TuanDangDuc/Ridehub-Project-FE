const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const mapUserRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userName: row.username || row.user_name || '',
    email: row.email || '',
    firstName: row.firstname || row.first_name || '',
    lastName: row.lastname || row.last_name || '',
    name: row.name || `${row.firstname || ''} ${row.lastname || ''}`.trim() || row.username || row.email || '',
    avatarUrl: row.avatar_url || row.avatarUrl || '',
    phone: row.phone_number || row.phone || '',
    identityNumber: row.identity_number || row.identityNumber || '',
    dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().split('T')[0] : '',
    sex: row.sex || '',
    role: row.role || 'USER',
    status: row.status || 'ACTIVE',
    balance: row.balance != null ? Number(row.balance) : 0
  };
};

const userSelectQuery = `
SELECT
  a.id,
  a.username,
  a.email,
  a.phone,
  u.firstname,
  u.lastname,
  u.avatar_url,
  u.phone_number,
  u.identity_number,
  u.date_of_birth,
  u.sex,
  u.role,
  u.status,
  u.balance
FROM account a
LEFT JOIN users u ON a.id = u.id
`;

app.post('/user/register', async (req, res) => {
  const {
    email,
    password,
    username,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    identityNumber,
    sex
  } = req.body;

  const id = randomUUID();
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const finalUsername = username || fullName || (email ? email.split('@')[0] : null);

  try {
    await pool.query('BEGIN');

    await pool.query(
      'INSERT INTO account (id, email, password, username, phone) VALUES ($1, $2, $3, $4, $5)',
      [id, email, password, finalUsername, phone]
    );

    await pool.query(
      `INSERT INTO users (id, firstname, lastname, phone_number, role, status, balance, sex, date_of_birth, identity_number, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        id,
        firstName || '',
        lastName || '',
        phone || '',
        'USER',
        'ACTIVE',
        0,
        sex || '',
        dateOfBirth || null,
        identityNumber || ''
      ]
    );

    await pool.query('COMMIT');

    const result = await pool.query(`${userSelectQuery} WHERE a.id = $1`, [id]);
    res.json(mapUserRow(result.rows[0]));
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('REGISTER error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.post('/user/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const result = await pool.query(
      `${userSelectQuery} WHERE (a.email=$1 OR a.phone=$1) AND a.password=$2 LIMIT 1`,
      [identifier, password]
    );

    if (result.rows.length > 0) {
      res.json(mapUserRow(result.rows[0]));
    } else {
      res.status(401).send('Sai tài khoản hoặc mật khẩu');
    }
  } catch (err) {
    console.error('LOGIN error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.get('/user', async (req, res) => {
  try {
    const result = await pool.query(userSelectQuery);
    res.json(result.rows.map(mapUserRow));
  } catch (err) {
    console.error('GET /user error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const result = await pool.query(`${userSelectQuery} WHERE a.id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(mapUserRow(result.rows[0]));
  } catch (err) {
    console.error('GET /user/:id error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.put('/user', async (req, res) => {
  const {
    id,
    name,
    email,
    phone,
    avatarUrl,
    dateOfBirth,
    identityNumber,
    sex
  } = req.body;

  if (!id) {
    return res.status(400).send('Missing user id');
  }

  const nameParts = (name || '').trim().split(' ').filter(Boolean);
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
  const lastName = nameParts.slice(-1).join(' ') || '';

  try {
    await pool.query('BEGIN');
    await pool.query('UPDATE account SET email=$1, phone=$2 WHERE id=$3', [email, phone, id]);
    await pool.query(
      `INSERT INTO users (id, firstname, lastname, phone_number, avatar_url, date_of_birth, identity_number, sex)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname, phone_number = EXCLUDED.phone_number, avatar_url = EXCLUDED.avatar_url, date_of_birth = EXCLUDED.date_of_birth, identity_number = EXCLUDED.identity_number, sex = EXCLUDED.sex`,
      [id, firstName, lastName, phone || '', avatarUrl || '', dateOfBirth || null, identityNumber || '', sex || '']
    );
    await pool.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('PUT /user error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.patch('/user/:id/role', async (req, res) => {
  const { role } = req.query;
  try {
    await pool.query('UPDATE users SET role=$1 WHERE id=$2', [role, req.params.id]);
    const result = await pool.query(`${userSelectQuery} WHERE a.id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(mapUserRow(result.rows[0]));
  } catch (err) {
    console.error('PATCH /user/:id/role error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.patch('/user/:id/status', async (req, res) => {
  const { status } = req.query;
  try {
    await pool.query('UPDATE users SET status=$1 WHERE id=$2', [status, req.params.id]);
    const result = await pool.query(`${userSelectQuery} WHERE a.id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(mapUserRow(result.rows[0]));
  } catch (err) {
    console.error('PATCH /user/:id/status error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.delete('/user/:id', async (req, res) => {
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM account WHERE id=$1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    await pool.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('DELETE /user/:id error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.listen(3000, () => console.log('Server chạy port 3000'));