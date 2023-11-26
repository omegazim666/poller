const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('debug', console.log);

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
client.login('Your Key Here');

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', (message) => {
  try {
    if (message.author.bot) return;

    // Change the trigger text to start the poll
    if (message.content.includes('!voteserver')) {
      console.log('Trigger text detected. Starting poll...');
      createPoll(message);
    }

    // Your other commands and checks can go here...

  } catch (error) {
    console.error('Error in messageCreate:', error);
  }
});

async function createPoll(message) {
  try {
    console.log('createPoll function called!');

    const pollEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('🌎     Server Selection, 60 seconds to vote!     <a:netscape:655578717736796181> ')
      .setDescription('React with the corresponding emoji to vote for your preferred server.')
      .addFields(
        { name: 'ip4 - USA', value: 'React with 🇺🇸 for USA server' },
        { name: 'ip2 - UK', value: 'React with 🇬🇧 for UK server' },
        { name: 'ip5 - Aus', value: 'React with 🇦🇺 for Australia server' }
      );

    const sentMessage = await message.channel.send({ content: 'Poll is now live!', embeds: [pollEmbed] });

    console.log('Poll message sent.');

    // Add reaction emojis to the poll message
    await sentMessage.react('🇺🇸'); // USA
    await sentMessage.react('🇬🇧'); // UK
    await sentMessage.react('🇦🇺'); // Aus

    // Set a timeout for the poll
    const durationInSeconds = 60; // Adjust as needed
    console.log(`Poll will close in ${durationInSeconds} seconds.`);

    // Wait for reactions
    await new Promise(resolve => setTimeout(resolve, durationInSeconds * 1000));

    // Get reactions manually from the cache
    const reactions = sentMessage.reactions.cache;

    console.log('Collected reactions:', reactions);

    // Calculate the results
    let usVotes = 0;
    let ukVotes = 0;
    let ausVotes = 0;

    // Fetch users who reacted for each emoji
    const usReactedUsers = (await reactions.get('🇺🇸')?.users.fetch()).filter(user => !user.bot);
    const ukReactedUsers = (await reactions.get('🇬🇧')?.users.fetch()).filter(user => !user.bot);
    const ausReactedUsers = (await reactions.get('🇦🇺')?.users.fetch()).filter(user => !user.bot);

    usVotes = usReactedUsers.size;
    ukVotes = ukReactedUsers.size;
    ausVotes = ausReactedUsers.size;

    console.log(`Votes: USA - ${usVotes}, UK - ${ukVotes}, Aus - ${ausVotes}`);

    let winningOption;
    if (usVotes > ukVotes && usVotes > ausVotes) {
      winningOption = 'USA'; // USA
    } else if (ukVotes > usVotes && ukVotes > ausVotes) {
      winningOption = 'UK'; // UK
    } else if (ausVotes > usVotes && ausVotes > ukVotes) {
      winningOption = 'Aus'; // Australia
    } else {
      winningOption = 'No clear winner';
    }

    // Announce the winning poll in the channel
    message.channel.send(`<:winston:1178434656807440424>  The winning poll is: ${winningOption}`);

    // After 60 seconds, send additional instructions
    let additionalInstructions;
    if (winningOption === 'USA') {
      additionalInstructions = '.ip4';
    } else if (winningOption === 'UK') {
      additionalInstructions = '.ip2';
    } else if (winningOption === 'Aus') {
      additionalInstructions = '.ip5';
    } else {
      additionalInstructions = 'No clear winner. Cannot provide connection instructions.';
    }

    message.channel.send(additionalInstructions);
  } catch (error) {
    console.error('Error in createPoll:', error);
  }
}
