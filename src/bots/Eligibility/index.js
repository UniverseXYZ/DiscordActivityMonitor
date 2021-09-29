// In order for this bot to work, we have to register the desired commands first, you can use
// the deployment script in src/deployment/commands.js

// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import fs from 'fs';
// Load the process envs
import dotenv from 'dotenv';
dotenv.config();
const TOKEN = process.env.RBR_BOT_TOKEN;
const REWARD_EARLY_COMUNNITY_OUTPUT_DIR = process.env.REC_OUTPUT_DIR;
const ELIGIBLE_OUTPUT_DIR = process.env.ELGB_OUTPUT_DIR;
const RBR_OUTPUT_DIR = process.env.RBR_OUTPUT_DIR;
const RBR_TOP_WINNERS_COUNT = process.env.RBR_TOP_WINNERS;
const ELGB_ENTRY_DIR = process.env.ELGB_ENTRY_DIR;
const ELGB_MID_DIR = process.env.ELGB_MID_DIR;
const ELGB_PRO_DIR = process.env.ELGB_PRO_DIR;

const POSTS_THRESHOLD = {
    entryLevel: 1,
    midLevel: 5,
    proLevel: 20,
};

const DIR_BY_LEVEL = {
    1: ELGB_ENTRY_DIR,
    5: ELGB_MID_DIR,
    20: ELGB_PRO_DIR,
}

import EthereumAddress from 'ethereum-address';
class Eligibility {
	constructor() {
		// Create a new client instance
		this._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
		// Login to Discord with your client's token
		this._client.login(TOKEN);
        this._earlyCommunityUsers = null;
        this._topByRank = null;
	}

    loadFiles() {
        return new Promise(res => {
            // Load all the statistics files
            const rawdataEarlyComunnity = fs.readFileSync(REWARD_EARLY_COMUNNITY_OUTPUT_DIR);
            this._earlyCommunityUsers = JSON.parse(rawdataEarlyComunnity);

            const rawdataByrank = fs.readFileSync(RBR_OUTPUT_DIR);
            // Take the top N winners based on the .env file
            this._topByRank= JSON.parse(rawdataByrank).slice(0, RBR_TOP_WINNERS_COUNT);
            res();
        })
    }

	listenForCommands(messageFilter) {
        this._client.once('ready', () => {
            console.log('Eligibility Ready!');
        });

        this._client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            // You can take the user id from interaction.user.id
            if (interaction.commandName === 'eligible') {
                const address = interaction.options.getString('address');
                const isAddress = EthereumAddress.isAddress(address);

                // The user has send invalid address
                if (!isAddress) {
                    return await interaction.reply({ content: 'Please send valid address !', ephemeral: true });
                }

                const userId = interaction.user.id;
                // TODO:: should we check in the two bots files for id occurance ?
                const user = this._earlyCommunityUsers.find(u => u.id === userId);
                // The user is not eligible
                if (!user) {
                    return await interaction.reply({ content: 'Sorry you are not eligible !', ephemeral: true });
                }

                // TODO:: Those are the Criterias:
                // Level 1 => Posted at least once && still members of the server
                // Level 2 => Posted at least 5 times && still members of the server
                // Level 3 => Posted at least 20+ times && still members of the server
                // Lever 4 => User is in top 5 'gm' sayers

                const userPostsCount = this._earlyCommunityUsers.find(u => u.id === userId);
                const userLevel = Object.keys(POSTS_THRESHOLD).reduce((result, current) => {
                    const levelThreshold = POSTS_THRESHOLD[current];
                    if (userPostsCount >= levelThreshold) result = levelThreshold
                    return result
                }, {});

                const outputDir = DIR_BY_LEVEL[userLevel];
                // TODO:: we are waiting for the combinations

                // Read the Eligible file
                const alreadyEligible = await this._alreadyEligible(userId);

                // The user is already in the list
                if (alreadyEligible) {
                    return await interaction.reply({ content: 'Sorry you are already in the list !', ephemeral: true });
                }

                // Add user to the list
                const rawdata = fs.readFileSync(ELIGIBLE_OUTPUT_DIR);
                const users = JSON.parse(rawdata);
                const newUsers = [...users, {
                    ...user,
                    address
                }];

                await this._saveFile(newUsers);

                console.log(user);
                await interaction.reply({ content: 'eligible!', ephemeral: true });
            }
          });
	}

    _alreadyEligible(id) {
        return new Promise(res => {
            const rawdata = fs.readFileSync(ELIGIBLE_OUTPUT_DIR);
            const users = JSON.parse(rawdata);
            const user = users.find(u => u.id === id);
            res(user);
        })
    }

    _saveFile(data) {
        return new Promise(res => {
            const file = fs.createWriteStream(ELIGIBLE_OUTPUT_DIR);
            file.write("[" + "\n");

            data.forEach((user, index) => {
                const isLast = index === data.length - 1;
                file.write(
                `	{ "username": "${user.username}", "address": "${user.address}", "id": "${user.id}", "isMember": "${user.isMember}", "postsCount": "${user.postsCount}"}${isLast ? '' : ','}` + "\n"
                );
            });

            file.write("]");
            file.end(res);

            console.log("Eligible File Saved !");
        })
    }
}

export default Eligibility;