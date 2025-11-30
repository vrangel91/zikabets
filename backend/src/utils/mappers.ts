import { User, Game, Bet, Transaction, Team, GameOdds } from '@prisma/client';

export type UserResponse = Omit<User, 'password' | 'cpf'>;
export type GameResponse = Game & {
  teamA: Team;
  teamB: Team;
  odds?: GameOdds | null;
};
export type BetResponse = Bet & {
  game: GameResponse;
  user: UserResponse;
};
export type TransactionResponse = Transaction & {
  game?: GameResponse | null;
};

export function mapUser(user: User): Omit<UserResponse, 'cpf' | 'password'> {
  const { password, cpf, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
}

export function mapGame(game: Game & { teamA: Team; teamB: Team; odds?: GameOdds | null }): GameResponse {
  // Usar type assertion para incluir campos opcionais que podem não existir no banco ainda
  const gameWithOptionalFields = game as Game & { 
    teamA: Team; 
    teamB: Team; 
    odds?: GameOdds | null;
    lowestDeaths?: string | null;
  };
  
  return {
    ...gameWithOptionalFields,
    lowestDeaths: gameWithOptionalFields.lowestDeaths ?? null,
    teamA: game.teamA,
    teamB: game.teamB,
    odds: game.odds || null,
  };
}

export function mapBet(bet: Bet & { game: GameResponse; user: UserResponse }): BetResponse {
  return {
    ...bet,
    game: bet.game,
    user: bet.user,
  };
}

export function mapTransaction(
  transaction: Transaction & { game?: GameResponse | null },
): TransactionResponse {
  return {
    ...transaction,
    game: transaction.game || null,
  };
}

