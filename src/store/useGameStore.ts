import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { useUserStore } from './useUserStore';
import { routes } from '@/utils/routes';

export interface Player {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  players?: Player[];
}

export interface GameOdds {
  id: string;
  gameId: string;
  teamAOdds: number;
  teamBOdds: number;
  durationOdds?: Record<string, number>;
  topKillerOdds: number;
  lowestDeathsOdds: number;
  topKillerPlayerOdds?: Record<string, number>;
  lowestDeathsPlayerOdds?: Record<string, number>;
  roshanTotalOdds?: Record<string, number>;
  firstRoshanOdds?: Record<string, number>;
  firstFFOdds?: Record<string, number>;
}

export interface Game {
  id: string;
  teamAId: string;
  teamBId: string;
  startTime: string;
  status: 'SCHEDULED' | 'LIVE' | 'CLOSED';
  winnerId?: string;
  duration?: number;
  topKiller?: string;
  lowestDeaths?: string;
  roshanTotal?: number;
  firstRoshanTeamId?: string;
  firstFFTeamId?: string;
  createdAt: string;
  updatedAt: string;
  teamA: Team;
  teamB: Team;
  odds?: GameOdds | null;
}

export interface Bet {
  id: string;
  userId: string;
  gameId: string;
  type: 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF';
  selection: string;
  amount: number;
  odds: number;
  status: 'PENDING' | 'WON' | 'LOST';
  isMultiple: boolean;
  multipleId?: string;
  returnAmount?: number;
  createdAt: string;
  updatedAt: string;
  game: Game;
  user: any;
}

export const useGameStore = defineStore('game', () => {
  const games = ref<Game[]>([]);
  const bets = ref<Bet[]>([]);
  const teams = ref<Team[]>([]);
  const ranking = ref<any[]>([]);
  const loading = ref(false);

  const upcomingGames = computed(() => {
    return games.value.filter((game) => game.status === 'SCHEDULED');
  });

  const closedGames = computed(() => {
    return games.value.filter((game) => game.status === 'CLOSED');
  });

  // Fetch games
  async function fetchGames(status?: string) {
    try {
      loading.value = true;
      const response = await api.get(routes.games.list(status));
      games.value = response.data.games;
      return response.data.games;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Fetch game by ID
  async function fetchGame(id: string) {
    try {
      loading.value = true;
      const response = await api.get(routes.games.get(id));
      return response.data.game;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Fetch ranking
  async function fetchRanking() {
    try {
      loading.value = true;
      const response = await api.get(routes.games.ranking());
      ranking.value = response.data.ranking;
      return response.data.ranking;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Fetch user bets
  async function fetchBets(status?: string) {
    try {
      loading.value = true;
      const response = await api.get(routes.bets.list(status));
      bets.value = response.data.bets;
      return response.data.bets;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Place bet
  async function placeBet(data: {
    gameId: string;
    type: 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS';
    selection: string;
    amount: number;
    isMultiple?: boolean;
    multipleId?: string;
    adjustedOdds?: number;
  }) {
    try {
      loading.value = true;
      const response = await api.post(routes.bets.create(), data);
      bets.value.unshift(response.data.bet);
      // Refresh user balance
      const userStore = useUserStore();
      await userStore.fetchProfile();
      return response.data.bet;
    } catch (error: any) {
      console.error('Erro completo na aposta:', error);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Erro ao fazer aposta';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Admin: Fetch teams
  async function fetchTeams() {
    try {
      loading.value = true;
      const response = await api.get(routes.admin.teams.list());
      teams.value = response.data.teams;
      return response.data.teams;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Admin: Create team
  async function createTeam(data: { name: string; logo?: string }) {
    try {
      loading.value = true;
      const response = await api.post(routes.admin.teams.create(), data);
      teams.value.push(response.data.team);
      return response.data.team;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar time');
    } finally {
      loading.value = false;
    }
  }

  // Admin: Update team
  async function updateTeam(id: string, data: { name: string; logo?: string }) {
    try {
      loading.value = true;
      const response = await api.put(routes.admin.teams.update(id), data);
      const index = teams.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        teams.value[index] = response.data.team;
      }
      return response.data.team;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar time';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Admin: Delete team
  async function deleteTeam(id: string) {
    try {
      loading.value = true;
      await api.delete(routes.admin.teams.delete(id));
      teams.value = teams.value.filter((t) => t.id !== id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao deletar time';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Admin: Fetch players
  async function fetchPlayers(teamId?: string) {
    try {
      loading.value = true;
      const response = await api.get(teamId ? `${routes.admin.players.list()}?teamId=${teamId}` : routes.admin.players.list());
      return response.data.players;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Admin: Create player
  async function createPlayer(data: { name: string; teamId: string }) {
    try {
      loading.value = true;
      const response = await api.post(routes.admin.players.create(), data);
      // Atualizar o time na lista
      const team = teams.value.find((t) => t.id === data.teamId);
      if (team && team.players) {
        team.players.push(response.data.player);
      }
      return response.data.player;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar jogador');
    } finally {
      loading.value = false;
    }
  }

  // Admin: Delete player
  async function deletePlayer(id: string) {
    try {
      loading.value = true;
      await api.delete(routes.admin.players.delete(id));
      // Remover player dos times
      teams.value.forEach((team) => {
        if (team.players) {
          team.players = team.players.filter((p: any) => p.id !== id);
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao deletar jogador');
    } finally {
      loading.value = false;
    }
  }

  // Admin: Create game
  async function createGame(data: {
    teamAId: string;
    teamBId: string;
    startTime: string;
    teamAOdds: number;
    teamBOdds: number;
    durationOdds?: Record<string, number>;
    topKillerOdds: number;
  }) {
    try {
      loading.value = true;
      const response = await api.post(routes.admin.games.create(), data);
      games.value.push(response.data.game);
      return response.data.game;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar jogo');
    } finally {
      loading.value = false;
    }
  }

  // Admin: Update game
  async function updateGame(
    id: string,
    data: {
      teamAId: string;
      teamBId: string;
      startTime: string;
      teamAOdds: number;
      teamBOdds: number;
      durationOdds?: Record<string, number>;
      topKillerOdds: number;
      lowestDeathsOdds?: number;
    }
  ) {
    try {
      loading.value = true;
      const response = await api.put(routes.admin.games.update(id), data);
      const index = games.value.findIndex((g) => g.id === id);
      if (index !== -1) {
        games.value[index] = response.data.game;
      }
      return response.data.game;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar jogo';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Admin: Update odds
  async function updateOdds(
    gameId: string,
    data: {
      teamAOdds?: number;
      teamBOdds?: number;
      durationOdds?: Record<string, number>;
      topKillerOdds?: number;
      lowestDeathsOdds?: number;
      topKillerPlayerOdds?: Record<string, number>;
      lowestDeathsPlayerOdds?: Record<string, number>;
      roshanTotalOdds?: Record<string, number>;
      firstRoshanOdds?: Record<string, number>;
      firstFFOdds?: Record<string, number>;
    },
  ) {
    try {
      loading.value = true;
      const url = routes.admin.games.updateOdds(gameId);
      const response = await api.patch(url, data);
      const index = games.value.findIndex((g) => g.id === gameId);
      if (index !== -1) {
        games.value[index] = response.data.game;
      }
      return response.data.game;
    } catch (error: any) {
      console.error('[UpdateOdds] Erro:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar odds');
    } finally {
      loading.value = false;
    }
  }

  // Admin: Delete game
  async function deleteGame(gameId: string) {
    try {
      loading.value = true;
      await api.delete(routes.admin.games.delete(gameId));
      games.value = games.value.filter((g) => g.id !== gameId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao deletar jogo';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Admin: Close game
  async function closeGame(
    gameId: string,
    data: {
      winnerId?: string;
      duration?: number;
      topKiller?: string;
      lowestDeaths?: string;
    },
  ) {
    try {
      loading.value = true;
      const response = await api.post(routes.admin.games.close(gameId), data);
      const index = games.value.findIndex((g) => g.id === gameId);
      if (index !== -1) {
        games.value[index] = response.data.game;
      }
      return response.data.game;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao fechar jogo');
    } finally {
      loading.value = false;
    }
  }

  return {
    games,
    bets,
    teams,
    ranking,
    loading,
    upcomingGames,
    closedGames,
    fetchGames,
    fetchGame,
    fetchRanking,
    fetchBets,
    placeBet,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    createGame,
    updateGame,
    deleteGame,
    updateOdds,
    closeGame,
    fetchPlayers,
    createPlayer,
    deletePlayer,
  };
});
