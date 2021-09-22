// Requirements
// Bot #1 - one time thing. To reward early community

// Scrape all user names that have:

// 1) posted at least once
// 2) are still members of the server by the current date (whenever we buld the bot, e.g. 22.09)

// +

// Scrape all user names that have:
// 1) posted at least 5 times
// 2) are still members of the server


// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
// Load the process envs
require('dotenv').config();
const fs = require('fs');
const TOKEN = process.env.REC_BOT_TOKEN;
const SERVER_NAME = process.env.REC_SERVER_NAME;
const SUPPORTED_MESSAGE_TYPES = process.env.SUPPORTED_MESSAGE_TYPES;

class RewardEarlyComunnityBot {
	constructor() {
		// Create a new client instance
		this._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
		// Login to Discord with your client's token
		this._client.login(TOKEN);
		this._attachListeners();
	}

	_attachListeners() {
		this._client.once('ready', async () => {
			console.log('Client is Ready !');

			const LOCAL_DB = {};
			const CHANNEL_MANAGER = this._client.channels;
			const GUILD_MANAGER = this._client.guilds;

			const textChannelIds = CHANNEL_MANAGER.cache.filter(c => c.id && c.type === 'text').map(c => c.id);
			const guild = GUILD_MANAGER.cache.find(g => g.name === SERVER_NAME);

			if (!guild) return console.error('There is no such guild (server name), for this Client, check .env configuration !');

			const MEMBERS_MANAGER = guild.members;

			const scrapeMessagesPromise = textChannelIds.map(async id => this._scrapeChannelMessagesRecursivly(id, null, CHANNEL_MANAGER, LOCAL_DB));
			await Promise.all(scrapeMessagesPromise);

			await this._markUserMembers(LOCAL_DB, MEMBERS_MANAGER);

			this._saveFile(LOCAL_DB);
		});
	}

	/**
	 * This method is scraping all messages from a channel recursivly
	 * @param {string} _channelId
	 * @param {string} lastMessageId
	 * @param {Object} channelManager
	 * @param {Object} localDb
	 * @returns
	 */
	async _scrapeChannelMessagesRecursivly(_channelId = null, lastMessageId = null, channelManager, localDb) {
		if (!_channelId) return console.warn('Scrape messages error: Missing channel id !');

		const channel = await channelManager.fetch(_channelId);
		const messages = await channel.messages.fetch({limit: 1, before: lastMessageId});

		// Exit the recursion
		if (messages.size < 1) return;

		lastMessageId = messages.last().id;

		// Don't get the bot messages, deleted and other than SUPPORTED_TYPES
		const filtered = messages.filter(m => !m.bot && !m.deleted && SUPPORTED_MESSAGE_TYPES.includes(m.type));

		// Save the msgs count to users into the local object
		filtered.forEach(m => {
			// Create or get the entry
			localDb[m.author.username] = localDb[m.author.username] || { postsCount: 0 , isMember: false};
			// Increase user's posts count
			localDb[m.author.username].postsCount++;
		});

		return this._scrapeChannelMessagesRecursivly(_channelId, lastMessageId, channelManager, localDb);
	}

	/**
	 * This method checks if the user is still member in the server, and marks it
	 * @param {Object} localDb
	 * @param {Object} membersManager
	 */
	async _markUserMembers(localDb, membersManager) {
		const markUsersPromies = Object.keys(localDb).map(async userName => {
			const user = localDb[userName];
			const member = await membersManager.fetch({query: userName, limit: 1});
			user.isMember = member.size ? true : false;
		});

		await Promise.all(markUsersPromies);
	}


/**
 *
 * @param {Object} localDb
 */
	_saveFile(localDb) {
		const file = fs.createWriteStream("./database/test.json");
		file.write("[" + "\n");

		Object.keys(localDb).forEach((username, index) => {
			const isLast = index === Object.keys(localDb).length - 1;
			const user = localDb[username];
			file.write(
			`	{"userName": "${username}", "postsCount": "${user.postsCount}"}${isLast ? '' : ','}` + "\n"
			);
		});

		file.write("]");
		file.end();

		console.log("File Saved");
	}
}

new RewardEarlyComunnityBot();