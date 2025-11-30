-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "pot" INTEGER,
    "topKillerDefaultOdds" REAL,
    "topDeadDefaultOdds" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamAId" TEXT NOT NULL,
    "teamBId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "winnerId" TEXT,
    "duration" INTEGER,
    "topKiller" TEXT,
    "lowestDeaths" TEXT,
    "roshanTotal" INTEGER,
    "firstRoshanTeamId" TEXT,
    "firstFFTeamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "games_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "games_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_odds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "teamAOdds" REAL NOT NULL DEFAULT 1.5,
    "teamBOdds" REAL NOT NULL DEFAULT 1.5,
    "durationOdds" TEXT,
    "topKillerOdds" REAL NOT NULL DEFAULT 2.0,
    "lowestDeathsOdds" REAL NOT NULL DEFAULT 2.0,
    "topKillerPlayerOdds" TEXT,
    "lowestDeathsPlayerOdds" TEXT,
    "roshanTotalOdds" TEXT,
    "firstRoshanOdds" TEXT,
    "firstFFOdds" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "game_odds_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "odds" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isMultiple" BOOLEAN NOT NULL DEFAULT false,
    "multipleId" TEXT,
    "returnAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bets_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pix_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "qrCode" TEXT NOT NULL,
    "qrCodeBase64" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "pixCode" TEXT,
    "transactionId" TEXT,
    "mercadoPagoPaymentId" TEXT,
    "mercadoPagoStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "championships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startPhase" TEXT NOT NULL DEFAULT 'GROUPS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "championship_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "championshipId" TEXT NOT NULL,
    "hasRoundOf16" BOOLEAN NOT NULL DEFAULT false,
    "hasQuarterFinals" BOOLEAN NOT NULL DEFAULT false,
    "hasSemiFinals" BOOLEAN NOT NULL DEFAULT false,
    "hasFinal" BOOLEAN NOT NULL DEFAULT true,
    "startPhase" TEXT NOT NULL DEFAULT 'GROUPS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "championship_configs_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "championships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "championship_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "championshipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "championship_groups_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "championships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "championship_teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "advanced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "championship_teams_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "championship_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "championship_players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "championship_players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "championship_teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "championship_matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "championshipId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "teamAId" TEXT,
    "teamBId" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "matchDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "championship_matches_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "championships" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "championship_matches_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "championship_teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "championship_matches_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "championship_teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players_teamId_name_key" ON "players"("teamId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "game_odds_gameId_key" ON "game_odds"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "championship_configs_championshipId_key" ON "championship_configs"("championshipId");

-- CreateIndex
CREATE UNIQUE INDEX "championship_groups_championshipId_name_key" ON "championship_groups"("championshipId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "championship_players_teamId_name_key" ON "championship_players"("teamId", "name");
