CREATE TABLE posts (filename TEXT NOT NULL UNIQUE, h TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, image_url TEXT NOT NULL, alt_text TEXT NOT NULL, category TEXT NOT NULL, start_timestamp TEXT NOT NULL, end_timestamp TEXT NOT NULL, location TEXT NOT NULL);

CREATE TABLE tags (post_id INTEGER NOT NULL, name NOT NULL)

CREATE TABLE images (post_id INTEGER NOT NULL, url NOT NULL, featured INTEGER DEFAULT 0, rank INTEGER DEFAULT 0)
