PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE posts (posts_id INTEGER PRIMARY_KEY AUTO_INCREMENT, filename TEXT NOT NULL UNIQUE, post_type TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, image_url TEXT NOT NULL, alt_text TEXT NOT NULL, tags TEXT NOT NULL, start_timestamp TEXT NOT NULL, end_timestamp TEXT NOT NULL, location TEXT NOT NULL);
