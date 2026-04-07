CREATE TABLE users(
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
gamer_tag VARCHAR(30) NOT NULL UNIQUE,
full_name VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
profile_image TEXT NULL,
role ENUM('player','admin') NOT NULL DEFAULT 'player',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE games(
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL UNIQUE,
 logo TEXT NULL,
 genre VARCHAR(50) NOT NULL,
 max_players_per_team INT NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE teams(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  tag VARCHAR(6) NOT NULL UNIQUE,
  logo TEXT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE team_members(
 team_id INT UNSIGNED NOT NULL,
 user_id INT UNSIGNED  NOT NULL,
 role ENUM('captain', 'member') NOT NULL DEFAULT 'member',
 joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (team_id, user_id),
 CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
 CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tournaments(
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  format ENUM('single_elimination', 'double_elimination','round_robin') NOT NULL,
  max_teams INT NOT NULL,
  registration_deadline DATETIME NOT NULL,
  start_date DATETIME NOT NULL,
  prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('upcoming', 'registration_open','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tournaments_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT
);


CREATE TABLE tournament_registrations (
tournament_id INT UNSIGNED NOT NULL,
team_id INT UNSIGNED NOT NULL,
registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
status ENUM('pending', 'confirmed', 'disqualified') NOT NULL DEFAULT 'pending',
seed INT NULL,
PRIMARY KEY (tournament_id, team_id),
CONSTRAINT fk_tournament_registrations_tournament
FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
ON DELETE CASCADE,
CONSTRAINT fk_tournament_registrations_team
FOREIGN KEY (team_id) REFERENCES teams(id)
ON DELETE CASCADE
);

CREATE TABLE matches (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
tournament_id INT UNSIGNED NOT NULL,
round_number INT NOT NULL,
match_number INT NOT NULL,
team1_id INT UNSIGNED NULL,
team2_id INT UNSIGNED NULL,
winner_team_id INT UNSIGNED NULL,
score VARCHAR(10) NULL,
status ENUM('scheduled', 'ongoing', 'completed') NOT NULL DEFAULT 'scheduled',
scheduled_at DATETIME NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_matches_tournament
FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
ON DELETE CASCADE,
CONSTRAINT fk_matches_team1
FOREIGN KEY (team1_id) REFERENCES teams(id)
ON DELETE SET NULL,
CONSTRAINT fk_matches_team2
FOREIGN KEY (team2_id) REFERENCES teams(id)
ON DELETE SET NULL,
CONSTRAINT fk_matches_winner
FOREIGN KEY (winner_team_id) REFERENCES teams(id)
ON DELETE SET NULL
);

CREATE TABLE match_players (
match_id INT UNSIGNED NOT NULL,
user_id INT UNSIGNED NOT NULL,
team_id INT UNSIGNED NOT NULL,
performance_notes TEXT NULL,
PRIMARY KEY (match_id, user_id),
CONSTRAINT fk_match_players_match
FOREIGN KEY (match_id) REFERENCES matches(id)
ON DELETE CASCADE,
CONSTRAINT fk_match_players_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE,
CONSTRAINT fk_match_players_team
FOREIGN KEY (team_id) REFERENCES teams(id)
ON DELETE CASCADE
);

CREATE TABLE user_watchlist (
user_id INT UNSIGNED NOT NULL,
tournament_id INT UNSIGNED NOT NULL,
added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (user_id, tournament_id),
CONSTRAINT fk_user_watchlist_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE,
CONSTRAINT fk_user_watchlist_tournament
FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
ON DELETE CASCADE
);

CREATE TABLE team_invitations (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
team_id INT UNSIGNED NOT NULL,
invited_user_id INT UNSIGNED NOT NULL,
invited_by_user_id INT UNSIGNED NOT NULL,
status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
responded_at DATETIME NULL,
CONSTRAINT fk_team_invitations_team
FOREIGN KEY (team_id) REFERENCES teams(id)
ON DELETE CASCADE,
CONSTRAINT fk_team_invitations_invited_user
FOREIGN KEY (invited_user_id) REFERENCES users(id)
ON DELETE CASCADE,
CONSTRAINT fk_team_invitations_invited_by
FOREIGN KEY (invited_by_user_id) REFERENCES users(id)
ON DELETE CASCADE
);

CREATE TABLE audit_logs (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
user_id INT UNSIGNED NULL,
action VARCHAR(100) NOT NULL,
entity_type VARCHAR(50) NOT NULL,
entity_id INT UNSIGNED NULL,
details TEXT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_audit_logs_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL
);