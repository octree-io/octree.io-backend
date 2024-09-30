CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255),
  username VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  profile_pic TEXT,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expired_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_rooms (
  room_id VARCHAR(255) PRIMARY KEY,
  created_by VARCHAR(255),
  current_problem_id INT,
  current_round_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_room_users (
  room_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  profile_pic TEXT,
  socket_id VARCHAR(255) DEFAULT 'undefined',
  PRIMARY KEY (room_id, username, socket_id)
);

CREATE TABLE IF NOT EXISTS lobby_users (
  username VARCHAR(255) NOT NULL,
  profile_pic TEXT,
  socket_id VARCHAR(255) DEFAULT 'undefined',
  PRIMARY KEY (username, socket_id)
);
