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
  client.guilds.cache.forEach((guild) => {
      console.log(guild.name);
  });
  pg_client = await pool.connect();
  const result = await pg_client.query('CREATE TABLE IF NOT EXISTS counter (id text UNIQUE, count integer);')
});

client.on('message', async msg => {
  let authorID = msg.author.id.toString()
  await pg_client.query('INSERT INTO counter (id, count) VALUES ($1, 0) ON CONFLICT (id) DO NOTHING;', [authorID])
  await pg_client.query('UPDATE counter SET count = count + 1 WHERE id = $1;', [authorID])

  if (msg.content === '!postcount') {
    let result = await pg_client.query('SELECT count FROM counter WHERE id = $1;', [authorID])
    let reply = result['rows'][0].count
    msg.reply(reply);
  }
});

client.login(process.env.TOKEN)
