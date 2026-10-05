const Hapi = require("@hapi/hapi");
const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "posts");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const seedPosts = [
  {
    id: 1,
    author: "Jamie Lee",
    initials: "JL",
    color: "coral",
    time: "12 min ago",
    text: "A reminder that you don't have to have everything figured out to take the next small step. ☀️",
    likes: 12
  },
  {
    id: 2,
    author: "Alex Kim",
    initials: "AK",
    color: "mint",
    time: "38 min ago",
    text: "Spent the morning outside, got some fresh air, and came back with a clearer head. Highly recommend a little reset.",
    likes: 8
  },
  {
    id: 3,
    author: "Sam Rivera",
    initials: "SR",
    color: "gold",
    time: "1 hr ago",
    text: "What song instantly puts you in a better mood? Building a feel-good playlist and taking suggestions.",
    likes: 5
  }
];

const seedUsers = [
  {
    id: 1,
    email: "demo@socialhub.local",
    displayName: "Mark Piper",
    initials: "MP",
    role: "admin-user"
  }
];

async function readJson(file, fallback) {
  try {
    const text = await fs.readFile(file, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeJson(file, fallback);
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${file}.tmp`;
  await fs.writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(temporaryFile, file);
}

async function start() {
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || "0.0.0.0";
  const configuredOrigins = process.env.FRONTEND_ORIGINS
    ? process.env.FRONTEND_ORIGINS.split(",").map(origin => origin.trim()).filter(Boolean)
    : ["http://localhost:5080", "https://localhost:7080"];

  await fs.mkdir(DATA_DIR, { recursive: true });
  await readJson(POSTS_FILE, seedPosts);
  await readJson(USERS_FILE, seedUsers);

  const server = Hapi.server({
    port,
    host,
    routes: { cors: { origin: configuredOrigins } }
  });

  server.route({
    method: "GET",
    path: "/",
    handler: () => ({
      status: "ok",
      service: "SocialHub Hapi API",
      storage: "JSON flat files"
    })
  });

  server.route({
    method: "GET",
    path: "/posts/posts.json",
    handler: async () => readJson(POSTS_FILE, seedPosts)
  });

  server.route({
    method: "POST",
    path: "/posts/post.json",
    handler: async (request, h) => {
      const payload = request.payload || {};
      const text = typeof payload.text === "string" ? payload.text.trim() : "";
      if (!text || text.length > 500) {
        return h.response({ error: "Post text is required and must be 500 characters or fewer." }).code(400);
      }
      const colors = ["purple", "coral", "mint", "gold"];
      const posts = await readJson(POSTS_FILE, seedPosts);
      const post = {
        id: Date.now(),
        author: typeof payload.author === "string" && payload.author.length <= 80 ? payload.author : "Community member",
        initials: typeof payload.initials === "string" && payload.initials.length <= 4 ? payload.initials : "CM",
        color: colors.includes(payload.color) ? payload.color : "purple",
        text,
        time: "Just now",
        likes: 0
      };
      posts.unshift(post);
      await writeJson(POSTS_FILE, posts);
      return h.response(post).code(201);
    }
  });

  server.route({
    method: "GET",
    path: "/users/users.json",
    handler: async () => readJson(USERS_FILE, seedUsers)
  });

  await server.start();
  console.log(`SocialHub Hapi API running at ${server.info.uri}`);
  console.log(`Flat-file storage: ${DATA_DIR}`);
}

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

start();
