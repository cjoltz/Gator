# Gator (AggreGATOR) CLI

## Description

An aggregator CLI tool developed in TypeScript for a boot.dev course.
Learning focus is on SQL, CLIs, and long-running services.

Gator lets you register users, add RSS feeds, follow feeds other users have
added, and run a long-lived aggregator that periodically fetches those feeds
and stores their posts in Postgres so you can browse them from the terminal.

## Requirements

- [Node.js](https://nodejs.org/) (developed on v22) and npm
- [PostgreSQL](https://www.postgresql.org/) (a running server you can connect to)

## Setup

### 1. Install dependencies

```bash
git clone <this-repo-url>
cd gator
npm install
```

### 2. Create a database

Create an empty Postgres database for gator, for example:

```bash
psql -c "CREATE DATABASE gator;"
```

### 3. Create the config file

Gator reads its settings from `~/.gatorconfig.json` in your home directory.
Create it with your database connection string:

```json
{
  "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable"
}
```

Replace `username` and `password` with your Postgres credentials. Gator adds
a `current_user_name` field to this file itself when you register or log in,
so you don't need to set it by hand.

### 4. Run the migrations

This creates the tables gator needs. The migration tool reads the same config
file, so set that up first.

```bash
npm run migrate
```

## Usage

Run commands with:

```bash
npm run start <command> [args...]
```

### Commands

| Command | Description |
| --- | --- |
| `register <name>` | Create a user and log in as them |
| `login <name>` | Switch to an existing user |
| `users` | List all users and show who is logged in |
| `addfeed <name> <url>` | Add an RSS feed and follow it |
| `feeds` | List all feeds and who added them |
| `follow <url>` | Follow a feed another user has added |
| `following` | List the feeds you follow |
| `unfollow <url>` | Stop following a feed |
| `agg <interval>` | Fetch feeds continuously, one per interval (e.g. `30s`, `1m`). Stop with Ctrl+C |
| `browse [limit]` | Show the newest posts from feeds you follow (default 2) |
| `reset` | Delete all users, feeds, follows and posts. For development only |

### Example session

```bash
npm run start register alice
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
npm run start agg 30s        # leave running for a bit, then Ctrl+C
npm run start browse 5
```

`agg` is meant to run in its own terminal while you use the other commands.
Each tick fetches the feed that was fetched least recently, so please use a
polite interval and don't hammer the sites you follow.

## Files

Most files are in `./src`. Database schema and migrations live in
`./src/lib/db`, and your settings live in `~/.gatorconfig.json`.
