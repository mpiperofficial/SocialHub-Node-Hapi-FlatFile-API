# SocialHub flat-file storage

This portfolio version intentionally uses JSON files instead of SQL.

- `posts.json` stores published posts.
- `users.json` stores demo user profile records.

These are plain UTF-8 text files. The Hapi API reads them when data is requested and writes them when a post is created.

This is appropriate for a small portfolio demonstration, not for a production social/dating application. For production, replace this storage layer with a database and proper authentication.
