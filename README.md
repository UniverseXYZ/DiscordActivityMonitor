# Discord Bots

# Configuration
 ## In order for the bots to work you need to grant them the proper access:
![Premmision images](./assets/premissions.png?raw=true "Premissions")

 ## You also need to setup .env file, you can take a look at .env.example for more information


1. Reward Early Community Bot
 - Initialise a Discrod Client
 - The bot will go trough all text channels from that server and scrape the users posts count based on the following criteria:
   - The bot will exclude bot messages, deleted messages and slash commands
 - Mark if the users are still members of the Server
 - Save the users in a file in the following format
 ```
    { "username": "Taskudis", "id": "858760549675302952", "isMember": "true", "postsCount": "38"},
 ```
  - The output dir should be specified in .env under REC_OUTPUT_DIR for example:
   ```
   REC_OUTPUT_DIR = "./database/rewardCommunity.json"
   ```
2. Reward By Rank Bot
 - Initialise a Discrod Client
 - The bot will go trough all text channels from that server and scrape the users posts count based on the following criteria:
   - The bot will exclude bot messages, deleted messages and slash commands
   - The bot will exclude messages wich are not equal to desired message content for example count only 'gm' messages
 - Save the users in a file in the following format:
  ```
	{ "username": "Taskudis", "id": "858760549675302952", "isMember": "true", "postsCount": "10"},
  ```
  - The output dir should be specified in .env under RBR_OUTPUT_DIR for example:
   ```
   RBR_OUTPUT_DIR = "./database/rewardByRank.json"
   ```
3. Third item