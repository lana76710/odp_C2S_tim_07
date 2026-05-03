import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";
import { authenticate } from "./Middlewares/authentification/AuthMiddleware";

import { UserRepository } from "./Database/repositories/users/UserRepository";
// import { GameRepository } from "./Database/repositories/games/GameRepository";   // TODO: Član 1
// import { TeamRepository } from "./Database/repositories/teams/TeamRepository";   // TODO: Član 2

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
// import { GameService }   from "./Services/games/GameService";   // TODO: Član 1
// import { TeamService }   from "./Services/teams/TeamService";   // TODO: Član 2

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
// import { GameController }   from "./WebAPI/controllers/GameController";   // TODO: Član 1
import { TeamController } from "./WebAPI/controllers/TeamController";
import { HealthController } from "./WebAPI/controllers/HealthController";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userRepo = new UserRepository(db, logger);
//const gameRepo = new GameRepository(db, logger);
//const teamRepo = new TeamRepository(db, logger);

// Services
const authService = new AuthService(userRepo);
const userService = new UserService(userRepo);
//const gameService = new GameService(gameRepo);
const teamController = new TeamController();

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json());

app.use("/api/v1", new HealthController(db).getRouter());
app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.post("/api/v1/teams", authenticate, (req, res) => teamController.createTeam(req, res));
app.get("/api/v1/teams", authenticate, (req, res) => teamController.getMyTeams(req, res));
app.get("/api/v1/teams/:id", authenticate, (req, res) => teamController.getTeam(req, res));
app.delete("/api/v1/teams/:id", authenticate, (req, res) => teamController.deleteTeam(req, res));

app.post("/api/v1/teams/:id/invite", authenticate, (req, res) => teamController.inviteUser(req, res));
app.post("/api/v1/teams/invite/respond", authenticate, (req, res) => teamController.respondToInvite(req, res));

app.put("/api/v1/teams/:id", authenticate, (req, res) => teamController.updateTeam(req, res));
app.get("/api/v1/teams/:id/members", authenticate, (req, res) => teamController.getTeamMembers(req, res));

app.delete("/api/v1/teams/:id/leave", authenticate, (req, res) => teamController.leaveTeam(req, res));
app.delete("/api/v1/teams/:id/members/:userId", authenticate, (req, res) => teamController.kickMember(req, res));

app.patch("/api/v1/teams/:id/transfer-captain", authenticate, (req, res) => teamController.transferCaptain(req, res));
export default app;
