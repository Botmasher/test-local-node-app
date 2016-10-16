const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE location(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, guilty BOOLEAN)');
query.on('end', function () {
	client.end();
});