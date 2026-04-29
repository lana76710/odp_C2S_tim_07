import { Tournament } from "../../models/Tournament";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";

export interface ITournamentService {
  getAll(filters: { gameId?: number; status?: string; format?: string }): Promise<Tournament[]>;
  getById(id: number): Promise<Tournament | null>;
  create(dto: CreateTournamentDto): Promise<Tournament | null>;
  update(id: number, dto: Partial<CreateTournamentDto>): Promise<Tournament | null>;
  delete(id: number): Promise<boolean>;
}