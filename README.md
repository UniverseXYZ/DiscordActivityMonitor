# Discord Bots

# Configuration

### Start up the Bots
 - npm install
 - npm run start
 ## In order for the bots to work you need to grant them the proper access (see the image):
![Premmision images](./assets/premissions.png?raw=true "Premissions")

 ## You also need to setup .env file, you can take a look at .env.example for more information


## 1. Reward Early Community Bot
### Responsible for scraping all user messages and count them
 - Initialise a Discrod Client
 - The bot will go trough all text channels from that server and scrape the users posts count based on the following criteria:
   - The bot will exclude bot messages, deleted messages and slash commands
 - Mark if the users are still members of the Server
 - Save the users in a file in the following format (The file must be with empty []):

    `{ "username": "Taskudis", "id": "858760549675302952", "isMember": "true", "postsCount": "38"},`
  - The output dir should be specified in .env under REC_OUTPUT_DIR for example:

    `REC_OUTPUT_DIR = "./database/rewardCommunity.json"`
## 2. Reward By Rank Bot
### Responsibe for scrapping all user messages based on specific content criteria
 - Initialise a Discrod Client
 - The bot will go trough all text channels from that server and scrape the users posts count based on the following criteria:
   - The bot will exclude bot messages, deleted messages and slash commands
   - The bot will exclude messages wich are not equal to desired message content for example count only 'gm' messages
 - Save the users in a file in the following format (The file must be with empty []):

	`{ "username": "Taskudis", "id": "858760549675302952", "isMember": "true", "postsCount": "10"},`
  - The output dir should be specified in .env under RBR_OUTPUT_DIR for example:

    `RBR_OUTPUT_DIR = "./database/rewardByRank.json"`
## 3. Slash Commands Deployment script
### Responsible for deployng the slash command onto the desired application id(BOT id)
 - Create Slash Command
 - Deploy to the application

## 4. Eligibility Bot
### Responsible for listening for slash commands and saving user address if the user is eligible for win
 - Initialise a Discrod Client
 - Loads from the fs the results from the previous two bots
 - Listen for specific slash command
 - Upon 'eligible' command hit do the following:
    - check if the address value is valid address
    - get the user id
    - check in the loaded files(result) if user is eligible
    - if eligible write the user into the list and save the file and send success message
 - Upon not eligible return negative message