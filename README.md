<div align="center">
  <a href="https://github.com/divam/auris">
    <img src="docs/logo-1024x1024.png" alt="Auris" style="border-radius: 50%; width: 200px; height: 200px;">
  </a>

  <h1>Auris</h1>

  <p>
    Auris is a powerful, feature-rich Discord music bot built with <strong>Discord.js</strong>, <strong>TypeScript</strong>, and <strong>Lavalink</strong>.
  </p>
</div>

---

## 🔥 Key Features

🎛️ **Interactive Player Controls**
Every track sends a Now Playing embed with live inline buttons.

📻 **Smart Autoplay**
When the queue ends, bot automatically finds related tracks using YouTube mixes.

🔍 **Real-Time Autocomplete Search**
Live suggestions with title, author, and duration.

🎚️ **Smart Queue Management**
Skip, loop, seek, autoplay, shuffle, and clear the queue easily.

🔇 **Auto-Leave on Inactivity**
Bot disconnects automatically, keeping your server tidy.

🔒 **Permission-Aware Joining**
Validates permissions before joining.

🐛 **Graceful Error Handling**
Friendly messages for blocked videos, rate limits. etc.

🐳 **Docker Ready**
Full Docker & Docker Compose support with deployment profiles.

---

## 🎮 Commands

| Command         | Description                                       |
| --------------- | ------------------------------------------------- |
| `/play <query>` | Play a song or playlist by name or URL            |
| `/pause`        | Pause the current track                           |
| `/resume`       | Resume playback                                   |
| `/skip`         | Skip the current track                            |
| `/stop`         | Stop music and clear the queue                    |
| `/queue`        | View the current queue          |
| `/nowplaying`   | Show the currently playing track |
| `/loop [mode]`  | Set loop mode (off / track / queue)               |
| `/shuffle`      | Shuffle the queue                                 |
| `/seek <time>`  | Seek to a position in the track                   |
| `/autoplay`     | Toggle autoplay mode                              |
| `/clear`        | Clear the queue                                   |
| `/join`         | Join your voice channel                           |
| `/leave`        | Disconnect from voice                             |
| `/info`         | Show bot status                                   |

---

## 🎶 Supported Sources

- YouTube
- YouTube Music
- SoundCloud
- Spotify
- Apple Music
- Direct URLs
- And more

---

## 🔧 Requirements

Before starting, make sure you have:

- Node.js v18 or higher
- Java 17 or higher (Required to run Lavalink locally)

---

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/divam/auris.git
cd auris
npm install
```

2. Configure your environment:

```bash
cp .env.example .env
```

(Make sure to open the .env file and fill in your bot token and client ID!)

3. Build, deploy commands, and start ():

```bash
npm run build
npm run deploy  # registers slash commands in Discord
npm start
```
⚠️ Global slash commands can take up to **1 hour** to propagate across all Discord servers after deploying.

Configure Lavalink (Only if you are running Lavalink locally):

Download the latest [Lavalink.jar](https://github.com/lavalink-devs/Lavalink/releases)  and place it inside the lavalink folder. Then, copy the example configuration:

```bash
cp lavalink/example.application.yml lavalink/application.yml
```

To run the Lavalink server, open a new terminal in the lavalink directory and run:

```bash
java -jar Lavalink.jar
```

---

## 🐳 Docker Deployment

Using Docker is the easiest way to run Auris. Docker Profiles let you choose exactly what you want to run.

⚠️ Before running any Docker commands, make sure you have filled out your `.env` file!

---

### 1️⃣ Run Everything (Bot + Lavalink)

Starts both the Discord bot and a local Lavalink server together.

Set `LAVALINK_URL="lavalink:2333"` in your `.env`

```bash
cp lavalink/example.application.yml lavalink/application.yml
docker compose --profile all up -d
```

---

### 2️⃣ Run ONLY the Bot

Use this if you already have a Lavalink server hosted elsewhere.

Make sure `LAVALINK_URL` and `LAVALINK_AUTH` point to your external node in `.env`.

```bash
docker compose --profile auris up -d
```

---

### 3️⃣ Run ONLY Lavalink

Use this if you just want to spin up the Lavalink audio engine without starting the bot.

```bash
cp lavalink/example.application.yml lavalink/application.yml
docker compose --profile lavalink up -d
```

🔄 Watchtower is included and will automatically pull and redeploy updated images every 24 hours.

---

## 📜 Contributing

1. Fork the repository and create a new branch for your feature or bug fix.
2. Write clean, concise code following the existing style.
3. Document any new features or changes thoroughly.
4. Submit a pull request with a clear description of your changes.

---

## 🔐 License

Distributed under the **MIT License**.

---
