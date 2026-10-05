const API = window.SOCIALHUB_API_BASE || "http://0.0.0.0:10000";
const loginScreen = document.querySelector("#login-screen");
const appScreen = document.querySelector("#app-screen");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const feedList = document.querySelector("#feed-list");

// Performs loadPosts() Event Call
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  // Demo-only client-side credentials. Replace with real server-side authentication.
  if (email === "demo@socialhub.local" && password === "Pass123!") {
    loginError.textContent = "";
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    await loadPosts();
  } else {
    loginError.textContent = "That demo email or password doesn't match.";
  }
});

document.querySelector("#logout").addEventListener("click", () => {
  appScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.querySelector("#password").value = "";
});

// JS Function LoadPosts() Event Call
async function loadPosts() {
  try {
    const response = await fetch(`$/posts/posts.json`);
    if (!response.ok) throw new Error("API returned an error");
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    feedList.innerHTML = '<article class="post-card"><p class="post-text">Could not connect to the Hapi API. Start the Node server on port 3001, then refresh.</p></article>';
  }
}

function renderPosts(posts) {
  feedList.replaceChildren();
  posts.forEach(post => {
    const card = document.createElement("article");
    card.className = "post-card";
    const header = document.createElement("div");
    header.className = "post-header";
    const avatar = document.createElement("div");
    avatar.className = `avatar ${post.color || "purple"}`;
    avatar.textContent = post.initials || "SH";
    const meta = document.createElement("div");
    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.author;
    const time = document.createElement("div");
    time.className = "post-time";
    time.textContent = post.time || "Just now";
    meta.append(author, time);
    header.append(avatar, meta);
    const body = document.createElement("p");
    body.className = "post-text";
    body.textContent = post.text;
    const actions = document.createElement("div");
    actions.className = "post-actions";
    const like = document.createElement("button");
    like.textContent = `♡ Like (${post.likes ?? 0})`;
    like.addEventListener("click", () => {
      const liked = like.dataset.liked === "true";
      like.dataset.liked = String(!liked);
      like.textContent = `${liked ? "♡" : "♥"} Like (${(post.likes ?? 0) + (liked ? 0 : 1)})`;
    });
    const comment = document.createElement("span");
    comment.textContent = "◯ Comment";
    actions.append(like, comment);
    card.append(header, body, actions);
    feedList.append(card);
  });
}

document.querySelector("#post-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#post-text");
  const text = input.value.trim();
  if (!text) return;
  try {
    const response = await fetch(`$/posts/post.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: "Mark Piper", initials: "MP", color: "purple", text })
    });
    if (!response.ok) throw new Error("Could not publish");
    input.value = "";
    await loadPosts();
  } catch {
    alert("Could not publish. Make sure the Hapi API is running.");
  }
});
