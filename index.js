const Discord = require('discord.js');
const { Pool } = require('pg');

const client = new Discord.Client();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
let pg_client;

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  pg_client = await pool.connect();
  const result = await pg_client.query('CREATE TABLE IF NOT EXISTS counter (id integer UNIQUE, count integer);');
});

client.on('message', async msg => {
  //INSERT INTO counter (id, count) VALUES (1, -1) ON CONFLICT (id) DO NOTHING;
  //UPDATE counter SET count = count + 1 WHERE id = 1;
  //SELECT count FROM test WHERE id = 1;
  let authorID = msg.author.id
  await pg_client.query('INSERT INTO counter (id, count) VALUES ($1, -1) ON CONFLICT (id) DO NOTHING;', [authorID])
  await pg_client.query('UPDATE counter SET count = count + 1 WHERE id = $1;', [authorID])

  if (msg.content === '!postcount') {
    let reply = await pg_client.query('SELECT count FROM test WHERE id = $1;', [authorID])
    console.log(reply)
    msg.reply(reply);
  }
});

client.login(process.env.TOKEN)
