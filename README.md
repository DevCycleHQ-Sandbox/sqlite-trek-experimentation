# SQLite Trek: Feature Flag-Based Experimentation with Express and tinyhttp

This monorepo contains two Node.js applications (one using Express, the other tinyhttp) and demonstrates real-time experimentation using feature flags to compare the performance of SQLite (local), Turso, and SQLiteCloud. This project is inspired by the SQLite Trek app discussed in [this blog post]() and showcases how to set up and implement feature flags with DevCycle.

## Overview

In this project, we implement a Star Trek-themed application that allows users to query data from various SQLite databases. Using DevCycle’s feature flags, we dynamically route users to one of three databases:

- **SQLite (local)**: A local SQLite database.
- **Turso**: A distributed SQLite service optimized for edge computing.
- **SQLiteCloud**: A cloud-hosted SQLite service.

The feature flag setup ensures that users are evenly distributed across all three databases, allowing us to measure and compare query response times in real time.

## Table of Contents

- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the Applications](#running-the-applications)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Technologies

- **Node.js**: JavaScript runtime.
- **Express**: Web framework for building APIs.
- **tinyhttp**: Lightweight web framework for Node.js.
- **DevCycle**: Feature flagging and experimentation platform.
- **SQLite (local)**: Local SQLite database.
- **Turso**: Edge-optimized SQLite service.
- **SQLiteCloud**: Cloud-hosted SQLite service.

## Prerequisites

To follow along with this project, you need to complete the following steps:

1. **Create accounts on:**

   - [DevCycle](https://devcycle.com)
   - [Turso](https://turso.tech)
   - [SQLiteCloud](https://sqlitecloud.io)

2. **Set up databases**: Create the required `star_trek_series` table in each database (Local, Turso, and SQLiteCloud) to ensure uniformity.

### Table Structure

```sql
CREATE TABLE star_trek_series (
    id INTEGER PRIMARY KEY,
    series_name TEXT NOT NULL,
    premiere_year INTEGER NOT NULL,
    seasons INTEGER NOT NULL,
    captain TEXT NOT NULL,
    crew TEXT NOT NULL,
    description TEXT NOT NULL
);
```

## Setup and Installation

### Steps

1. Clone the repository:

   ```bash
   git clone sqlite-trek-experimentation
   cd sqlite-trek-experimentation
   ```

2. Install the dependencies for all workspaces:

   ```bash
   npm install
   ```

3. Set up the environment variables by creating a `.env` file in the root directory with the following content:

   ```bash
   LOCAL_SQLITE=./test.sqlite
   TURSO_URL=libsql://your-turso-instance-url
   TURSO_AUTH_TOKEN=your-turso-auth-token
   SQLITE_CLOUD_CONNECTION=sqlitecloud://your-sqlitecloud-instance
   DEVCYCLE_SERVER_SDK_KEY=your-devcycle-sdk-key
   ```

4. Ensure you have populated the databases by running the SQL queries provided above.

### Environment Variables

The project uses the following environment variables, which are centralized in the `.env` file:

- `LOCAL_SQLITE`: Path to the local SQLite database.
- `TURSO_URL`: The URL for the Turso database.
- `TURSO_AUTH_TOKEN`: The authentication token for the Turso database.
- `SQLITE_CLOUD_CONNECTION`: The connection string for SQLiteCloud.
- `DEVCYCLE_SERVER_SDK_KEY`: The SDK key for DevCycle.

## Running the Applications

To run both the Express and tinyhttp applications concurrently, use:

```bash
npm start
```

This command uses `concurrently` to run both apps:

- `Express` app will run on [http://localhost:5000](http://localhost:5000)
- `tinyhttp` app will run on [http://localhost:3000](http://localhost:3000)

### Individual Application Start

To run just the Express app:

```bash
npm start --workspace=express-app
```

To run just the tinyhttp app:

```bash
npm start --workspace=tinyhttp-app
```

## Feature Flag Setup in DevCycle

1. **Create a feature flag**: In your DevCycle dashboard, create a feature flag named `sqlite-trek-experiment`. This flag will determine which database solution (local, Turso, or SQLiteCloud) to use for each user.

2. **Define variations**:

   - Control: `local`
   - Variation A: `turso`
   - Variation B: `cloud`

3. **Set up targeting**: Distribute users evenly across the three variations to ensure fair testing of each database.

## Tracking Metrics in DevCycle

DevCycle will track the query response times for each database solution using the feature flags. The app sends the response time of each query back to DevCycle, allowing for performance analysis and comparison between the different database solutions.

## Project Structure

```
/my-monorepo
│
├── /apps
│   ├── /express-app       # Express.js app
│   └── /tinyhttp-app      # tinyhttp app
│
├── .env                   # Environment variables
├── package.json           # Monorepo setup with npm workspaces
└── package-lock.json      # Lockfile for npm dependencies
```

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue to discuss any changes.
