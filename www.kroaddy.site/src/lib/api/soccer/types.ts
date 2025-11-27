/**
 * Soccer API Types
 */

export interface Player {
  id: number;
  name: string;
  backNumber: number;
  position: string;
  birthDate: string;
  nationality: string;
  height: number;
  weight: number;
  teamId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  foundedYear: number;
  city: string;
  stadiumId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stadium {
  id: number;
  name: string;
  location: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerDTO {
  name: string;
  backNumber: number;
  position: string;
  birthDate: string;
  nationality: string;
  height: number;
  weight: number;
  teamId: number;
}

export interface UpdatePlayerDTO extends Partial<CreatePlayerDTO> {}

export interface CreateTeamDTO {
  name: string;
  foundedYear: number;
  city: string;
  stadiumId: number;
}

export interface CreateStadiumDTO {
  name: string;
  location: string;
  capacity: number;
}

export interface CreateScheduleDTO {
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
}

