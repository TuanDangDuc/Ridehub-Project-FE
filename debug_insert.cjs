const pool = require('./db');
const sql = 'INSERT INTO account (id,email,password,username) VALUES ($1,$2,$3,$4) RETURNING *';
const values = ['00000000-0000-0000-0000-000000000001','test-inspect@example.com','123456','testinspect'];
console.log('SQL', sql);
console.log('VALUES', values);
pool.query(sql, values)
  .then(r => { console.log('OK', r.rows[0]); process.exit(0); })
  .catch(err => { console.error('DB_ERROR', err.message); console.error(err); process.exit(1); });
