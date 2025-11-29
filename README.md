# Discord DM Bot

A Discord bot that sends direct messages to all users with a specific role using slash commands.

## Features

- 🤖 Sends DMs to all members with a specified role
- 🛡️ Admin-only command for security
- 📊 Reports success/failure counts
- ⚠️ Handles users with DMs disabled gracefully

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- A Discord Bot application from the [Discord Developer Portal](https://discord.com/developers/applications)

## Setup

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name your bot
3. Go to the "Bot" section and click "Add Bot"
4. Copy the **Token** and save it (you'll need this)
5. Under "TOKEN", click "Copy" to get your bot token

### 2. Configure Bot Permissions

1. Go to "OAuth2" → "URL Generator"
2. Under "SCOPES", select: `bot`
3. Under "PERMISSIONS", select:
   - Send Messages
   - Send Messages in Threads
   - Read Messages/View Channels
   - Read Message History
4. Copy the generated URL and open it to invite the bot to your server

### 3. Setup Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and fill in:
   - `DISCORD_TOKEN`: Your bot token from the Developer Portal
   - `CLIENT_ID`: Your bot's Client ID (found in "General Information" section)

   Example:
   ```
   DISCORD_TOKEN=MzAwODAxNDA2NzIwMjE2NTc2.xyz...
   CLIENT_ID=300801406720216576
   ```

### 4. Install Dependencies

```powershell
npm install
```

### 5. Register Slash Commands

Run this once to register the `/dmrole` command:

```powershell
node register-commands.js
```

### 6. Start the Bot

```powershell
npm start
```

You should see: `✅ Bot logged in as YourBotName#0000`

## Usage

### Send DM to Users with a Role

Use the `/dmrole` command in any server where the bot is present:

```
/dmrole role: @TargetRole message: Your message here
```

**Example:**
```
/dmrole role: @Members message: Welcome to our server!
```

**Requirements:**
- You must have **Administrator** permissions
- The bot will send DMs to all members with that role (excluding bots)
- The command will report how many messages were sent and how many failed

## Project Structure

```
bot/
├── index.js                 # Main bot file
├── register-commands.js     # Command registration script
├── package.json             # NPM dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment file
├── .gitignore              # Git ignore file
└── commands/
    └── dmrole.js           # DM role command
```

## Commands

### `/dmrole`

Sends a direct message to all users with a specific role.

**Parameters:**
- `role` (required): The role to target
- `message` (required): The message content to send

**Response Example:**
```
✅ Sent messages to 15 users.
⚠️ Failed: 2 users (may have DMs disabled or be bots)
```

## Troubleshooting

### Bot doesn't respond to commands
- Make sure you ran `node register-commands.js` to register the slash commands
- Verify your `DISCORD_TOKEN` and `CLIENT_ID` are correct
- Check that the bot has "Send Messages" permission

### "No members found with the role"
- Make sure members actually have the role assigned
- The role must be searchable by the bot

### "Failed to send DM to user"
- Users may have DMs disabled from people not on their friends list
- Bots are excluded and won't receive DMs
- Check bot permissions in your Discord server

### Bot won't start
- Verify Node.js is installed: `node --version`
- Make sure `.env` file exists and has correct tokens
- Check for syntax errors: `npm start` will show error messages

## Adding More Commands

To add more commands:

1. Create a new file in the `commands/` folder (e.g., `commands/newcommand.js`)
2. Follow the structure of `commands/dmrole.js`
3. Run `node register-commands.js` to register the new command
4. Restart the bot

## Error Handling

The bot includes error handling for:
- Missing administrator permissions
- API errors when fetching members
- Failed DM sends (users with DMs disabled)
- Unhandled promise rejections

## Security Notes

- ✅ `/dmrole` is admin-only
- ✅ Never commit the `.env` file to version control
- ✅ Keep your bot token private
- ⚠️ Ensure the bot has minimum necessary permissions

## Support

For Discord.js documentation, visit: https://discord.js.org/

## License

MIT
