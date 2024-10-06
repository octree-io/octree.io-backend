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
  room_name VARCHAR(255),
  created_by VARCHAR(255),
  round_duration INT DEFAULT 900,
  round_end_cooldown_duration INT DEFAULT 30,
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

CREATE TABLE IF NOT EXISTS room_logs (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  max_users INT
);

CREATE TABLE IF NOT EXISTS submissions (
  submission_id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  problem_id INT NOT NULL,
  type VARCHAR(50),
  language VARCHAR(50),
  code TEXT,
  output TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lobby_messages (
  message_id VARCHAR(255) PRIMARY KEY,
  channel_id VARCHAR(255),
  username VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(255),
  message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lobby_channels (
  channel_id VARCHAR(255) PRIMARY KEY,
  channel_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
