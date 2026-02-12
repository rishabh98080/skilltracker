const outputEl = document.getElementById("output");
const apiStatus = document.getElementById("apiStatus");

const state = {
  baseUrl: "",
  username: "",
  password: "",
  autoRefreshId: null,
};

const els = {
  baseUrl: document.getElementById("baseUrl"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  userId: document.getElementById("userId"),
  regUsername: document.getElementById("regUsername"),
  regPassword: document.getElementById("regPassword"),
  updateUsername: document.getElementById("updateUsername"),
  updatePassword: document.getElementById("updatePassword"),
  skillUserId: document.getElementById("skillUserId"),
  skillUserId2: document.getElementById("skillUserId2"),
  skillId: document.getElementById("skillId"),
  skillName: document.getElementById("skillName"),
  skillProficiency: document.getElementById("skillProficiency"),
  skillsList: document.getElementById("skillsList"),
  autoRefresh: document.getElementById("autoRefresh"),
};

const setOutput = (label, data) => {
  const stamp = new Date().toLocaleTimeString();
  const payload = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  outputEl.textContent = `[${stamp}] ${label}\n${payload}\n\n${outputEl.textContent}`;
};

const setStatus = (ok, message) => {
  apiStatus.textContent = message;
  apiStatus.classList.toggle("ok", ok);
  apiStatus.classList.toggle("error", !ok);
};

const baseUrl = () => {
  const value = els.baseUrl.value.trim() || "http://skilltracker-production.up.railway.app";
  return value.replace(/\/$/, "");
};

const authHeader = () => {
  const username = els.username.value.trim();
  const password = els.password.value;
  if (!username || !password) {
    return null;
  }
  const token = btoa(`${username}:${password}`);
  return `Basic ${token}`;
};

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const auth = authHeader();
  if (auth) {
    headers.Authorization = auth;
  }

  const response = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = data || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }

  return data ?? response.status;
};

const renderSkills = (skills) => {
  els.skillsList.innerHTML = "";
  if (!skills || skills.length === 0) {
    els.skillsList.innerHTML = `<div class="muted">No skills found.</div>`;
    return;
  }
  skills.forEach((skill) => {
    const item = document.createElement("div");
    item.className = "skill-item";
    item.innerHTML = `<strong>${skill.name ?? "(no name)"}</strong><br/><span class="muted">${skill.proficiency ?? ""}</span><br/><span class="muted">${skill.id ?? ""}</span>`;
    els.skillsList.appendChild(item);
  });
};

const attach = (id, handler) => {
  document.getElementById(id).addEventListener("click", handler);
};

attach("btnPing", async () => {
  try {
    const result = await request("/skill-tracker/login", { method: "GET" });
    setStatus(true, "API: authenticated");
    setOutput("Login", result);
    if (typeof result === "string") {
      els.userId.value = result;
      els.skillUserId.value = result;
      els.skillUserId2.value = result;
    }
  } catch (error) {
    setStatus(false, "API: error");
    setOutput("Login Error", error.message);
  }
});

attach("btnClear", () => {
  outputEl.textContent = "";
});

attach("btnRegister", async () => {
  const payload = {
    username: els.regUsername.value.trim(),
    password: els.regPassword.value,
  };
  try {
    const result = await request("/skill-tracker/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setOutput("Register", result ?? "Created");
  } catch (error) {
    setOutput("Register Error", error.message);
  }
});

attach("btnGetUser", async () => {
  const id = els.userId.value.trim();
  if (!id) return setOutput("Get User", "User ID required");
  try {
    const result = await request(`/skill-tracker/user/id/${id}`);
    setOutput("Get User", result);
  } catch (error) {
    setOutput("Get User Error", error.message);
  }
});

attach("btnUpdateUser", async () => {
  const id = els.userId.value.trim();
  if (!id) return setOutput("Update User", "User ID required");
  const payload = {
    username: els.updateUsername.value.trim(),
    password: els.updatePassword.value,
  };
  try {
    const result = await request(`/skill-tracker/user/id/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setOutput("Update User", result ?? "Updated");
  } catch (error) {
    setOutput("Update User Error", error.message);
  }
});

attach("btnDeleteUser", async () => {
  const id = els.userId.value.trim();
  if (!id) return setOutput("Delete User", "User ID required");
  try {
    const result = await request(`/skill-tracker/user/id/${id}`, {
      method: "DELETE",
    });
    setOutput("Delete User", result ?? "Deleted");
  } catch (error) {
    setOutput("Delete User Error", error.message);
  }
});

const fetchSkills = async () => {
  const userId = els.skillUserId.value.trim();
  if (!userId) return setOutput("Fetch Skills", "User ID required");
  try {
    const result = await request(`/skill-tracker/skill/id/${userId}`);
    setOutput("Fetch Skills", result);
    renderSkills(result);
  } catch (error) {
    setOutput("Fetch Skills Error", error.message);
  }
};

attach("btnGetSkills", fetchSkills);

attach("btnAddSkill", async () => {
  const userId = els.skillUserId2.value.trim();
  const name = els.skillName.value.trim();
  const proficiency = els.skillProficiency.value.trim();
  if (!userId || !name) return setOutput("Add Skill", "User ID and Name required");
  const payload = { name, proficiency };
  try {
    const result = await request(`/skill-tracker/skill/id/${userId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setOutput("Add Skill", result ?? "Created");
  } catch (error) {
    setOutput("Add Skill Error", error.message);
  }
});

attach("btnUpdateSkill", async () => {
  const userId = els.skillUserId2.value.trim();
  const skillId = els.skillId.value.trim();
  const name = els.skillName.value.trim();
  const proficiency = els.skillProficiency.value.trim();
  if (!userId || !skillId) return setOutput("Update Skill", "User ID and Skill ID required");
  const payload = { name, proficiency };
  try {
    const result = await request(`/skill-tracker/skill/userId/${userId}/skillId/${skillId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setOutput("Update Skill", result ?? "Updated");
  } catch (error) {
    setOutput("Update Skill Error", error.message);
  }
});

attach("btnDeleteSkill", async () => {
  const userId = els.skillUserId2.value.trim();
  const skillId = els.skillId.value.trim();
  if (!userId || !skillId) return setOutput("Delete Skill", "User ID and Skill ID required");
  try {
    const result = await request(`/skill-tracker/skill/userId/${userId}/skillId/${skillId}`, {
      method: "DELETE",
    });
    setOutput("Delete Skill", result ?? "Deleted");
  } catch (error) {
    setOutput("Delete Skill Error", error.message);
  }
});

els.autoRefresh.addEventListener("change", () => {
  if (els.autoRefresh.checked) {
    state.autoRefreshId = setInterval(fetchSkills, 5000);
    fetchSkills();
  } else if (state.autoRefreshId) {
    clearInterval(state.autoRefreshId);
    state.autoRefreshId = null;
  }
});
