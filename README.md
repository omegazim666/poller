# poller
A simple Unreal Tournament Discord bot for voting and selecting game servers. 

This bot requires node.js to run and requires configuration specific to your discord server in the file poller.js.
As I develop the bot I will add the ability to configure things from insdie the discord server and support to run multiple instances.

The current way to trigger the bot is set to type !voteserver but can be set to any keyword with or without the prefix.
After a 60 second time delay the poll will close and the bot will send a query request for the predefined server attributed to the region selected.
