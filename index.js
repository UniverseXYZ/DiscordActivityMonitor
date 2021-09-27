import RewardEarlyComunnity from './src/bots/RewardCommunity/index.js';
import RewardByRank from './src/bots/RewardByRank/index.js';
import Eligibility from './src/bots/Eligibility/index.js';

const RewardCommunityBot = new RewardEarlyComunnity();
await RewardCommunityBot.scrapeUSers();
RewardCommunityBot.getUsers(1, true);

const RewardByRankBot = new RewardByRank();
await RewardByRankBot.scrapeUSers('gm');
RewardByRankBot.getUsers(2);

const EligibilityBot = new Eligibility();
await EligibilityBot.loadFiles();
EligibilityBot.listenForCommands();