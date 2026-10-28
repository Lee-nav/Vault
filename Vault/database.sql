-- Select the target database in your hosting panel or MySQL client before import.
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- Each user owns a private collection of decks and study progress.
CREATE TABLE IF NOT EXISTS decks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(80) NULL,
  title VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(40) NOT NULL DEFAULT 'Custom',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_decks_user_slug (user_id, slug),
  KEY idx_decks_user_created (user_id, created_at),
  CONSTRAINT fk_decks_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cards (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  deck_id BIGINT UNSIGNED NOT NULL,
  question VARCHAR(500) NOT NULL,
  answer VARCHAR(1200) NOT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_cards_deck_position (deck_id, position),
  CONSTRAINT fk_cards_deck FOREIGN KEY (deck_id)
    REFERENCES decks (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Study streak, treat balance, and selected companion are private per account.
CREATE TABLE IF NOT EXISTS app_state (
  user_id BIGINT UNSIGNED NOT NULL,
  treats INT UNSIGNED NOT NULL DEFAULT 3,
  streak INT UNSIGNED NOT NULL DEFAULT 1,
  last_study_date DATE NULL,
  selected_pet VARCHAR(24) NOT NULL DEFAULT 'ember',
  PRIMARY KEY (user_id),
  CONSTRAINT fk_app_state_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS companion_progress (
  user_id BIGINT UNSIGNED NOT NULL,
  companion_id VARCHAR(24) NOT NULL,
  level INT UNSIGNED NOT NULL DEFAULT 1,
  xp SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, companion_id),
  CONSTRAINT fk_companion_progress_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
