// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
// Load the process envs
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
const TOKEN = process.env.REC_BOT_TOKEN;
const SERVER_NAME = process.env.REC_SERVER_NAME;
const OUTPUT_DIR = process.env.REC_OUTPUT_DIR;
const SUPPORTED_MESSAGE_TYPES = process.env.SUPPORTED_MESSAGE_TYPES;

class RewardEarlyComunnityBot {
	constructor() {
		// Create a new client instance
		this._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
		// Login to Discord with your client's token
		this._client.login(TOKEN);
	}

	async scrapeUSers() {
		return new Promise(res => {
			this._client.once('ready', async () => {
				console.log('Client is Ready !');

				const LOCAL_DB = {};
				const CHANNEL_MANAGER = this._client.channels;
				const GUILD_MANAGER = this._client.guilds;

				const textChannelIds = CHANNEL_MANAGER.cache.filter(c => c.id && c.type === 'text').map(c => c.id);
				const guild = GUILD_MANAGER.cache.find(g => g.name === SERVER_NAME);

				if (!guild) return console.error('There is no such guild (server name), for this Client, check .env configuration !');

				const MEMBERS_MANAGER = guild.members;

				const scrapeMessagesPromise = textChannelIds.map(async id => this._scrapeChannelMessages(id, CHANNEL_MANAGER, LOCAL_DB));
				await Promise.all(scrapeMessagesPromise);

				await this._markUserMembers(LOCAL_DB, MEMBERS_MANAGER);

				await this._saveFile(LOCAL_DB);
				res();
			});
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
	async _scrapeChannelMessages(_channelId = null, channelManager, localDb) {
		if (!_channelId) return console.warn('Scrape messages error: Missing channel id !');

		const channel = await channelManager.fetch(_channelId);
		const MAX_MESSAGES = 100; // Discord API limitation
		let lastMessageId = null; // IF no id is provided the fetch will return the messages from the beginning

		while(true) {
			const messages = await channel.messages.fetch({limit: MAX_MESSAGES, before: lastMessageId});

			lastMessageId = messages.last().id;

			// Don't get the bot messages, deleted and other than SUPPORTED_TYPES
			const filtered = messages.filter(m => !m.bot && !m.deleted && SUPPORTED_MESSAGE_TYPES.includes(m.type));

			// Save the msgs count to users into the local object
			filtered.forEach(m => {
				// Create or get the entry
				localDb[m.author.id] = localDb[m.author.id] || { postsCount: 0 ,isMember: false, username: m.author.username, id: m.author.id};
				// Increase user's posts count
				localDb[m.author.id].postsCount++;
			});

			const exit = messages.size < MAX_MESSAGES // We took and proceeded the last portion of the messages
			if(exit) break;
		}
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
		return new Promise(res => {
			const file = fs.createWriteStream(OUTPUT_DIR);
			file.write("[" + "\n");

			Object.keys(localDb).forEach((username, index) => {
				const isLast = index === Object.keys(localDb).length - 1;
				const user = localDb[username];
				file.write(
				`	{ "userName": "${user.username}", "id": "${user.id}", "isMember": "${user.isMember}", "postsCount": "${user.postsCount}"}${isLast ? '' : ','}` + "\n"
				);
			});

			file.write("]");
			file.end(res);

			console.log("File Saved");
		})
	}

	getUsers(postsCount) {
		const rawdata = fs.readFileSync(OUTPUT_DIR);
		const users = JSON.parse(rawdata);
		const filtered = users.filter(u => u.postsCount >= postsCount && u.isMember);
		console.log(filtered);
	}
}

export default RewardEarlyComunnityBot;