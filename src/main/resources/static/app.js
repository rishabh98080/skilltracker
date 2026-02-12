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
  const value = els.baseUrl.value.trim() || "https://skilltracker-production.up.railway.app";
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

const toHex = (value, length) => value.toString(16).padStart(length, "0");

const parseInteger = (value) => {
  if (Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const parseTimestamp = (value) => {
  const direct = parseInteger(value);
  if (direct !== null) return direct;
  if (typeof value === "string" || value instanceof Date) {
    const dateValue = new Date(value);
    if (!Number.isNaN(dateValue.getTime())) {
      return Math.floor(dateValue.getTime() / 1000);
    }
  }
  return null;
};

const buildObjectIdHex = (value) => {
  const timestamp =
    parseTimestamp(value.timestamp) ??
    parseTimestamp(value.timeSecond) ??
    parseTimestamp(value.time) ??
    parseTimestamp(value.date);
  const machineIdentifier =
    parseInteger(value.machineIdentifier) ??
    parseInteger(value.machine) ??
    parseInteger(value.machineId);
  const processIdentifier =
    parseInteger(value.processIdentifier) ??
    parseInteger(value.process) ??
    parseInteger(value.processId);
  const counter =
    parseInteger(value.counter) ??
    parseInteger(value.increment) ??
    parseInteger(value.inc);

  if (timestamp === null || machineIdentifier === null || processIdentifier === null || counter === null) {
    return "";
  }

  return (
    toHex(timestamp & 0xffffffff, 8) +
    toHex(machineIdentifier & 0xffffff, 6) +
    toHex(processIdentifier & 0xffff, 4) +
    toHex(counter & 0xffffff, 6)
  );
};

const normalizeSkillId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid;
    if (typeof value.oid === "string") return value.oid;
    if (typeof value.id === "string") return value.id;
    if (typeof value.hexString === "string") return value.hexString;
    if (typeof value.hex === "string") return value.hex;
    if (typeof value.value === "string") return value.value;
    if (typeof value.toHexString === "function") return value.toHexString();

    const derived = buildObjectIdHex(value);
    if (derived) return derived;
  }
  return "";
};

const renderSkills = (skills) => {
  els.skillsList.innerHTML = "";
  if (!skills || skills.length === 0) {
    els.skillsList.innerHTML = `<div class="muted">No skills found.</div>`;
    return;
  }
  skills.forEach((skill) => {
    const skillId = normalizeSkillId(skill.id ?? skill._id ?? skill.objectId);
    const hasId = Boolean(skillId);
    const item = document.createElement("div");
    item.className = "skill-item";
    item.innerHTML = `
      <div class="skill-row">
        <div>
          <strong>${skill.name ?? "(no name)"}</strong><br/>
          <span class="muted">${skill.proficiency ?? ""}</span><br/>
          <span class="muted">${hasId ? skillId : "ObjectId unavailable"}</span>
        </div>
        <div class="actions">
          <button class="skill-update" type="button" data-skill-action="update" data-skill-id="${skillId}" data-skill-name="${skill.name ?? ""}" data-skill-proficiency="${skill.proficiency ?? ""}" ${hasId ? "" : "disabled"}>Update</button>
          <button class="skill-delete" type="button" data-skill-action="delete" data-skill-id="${skillId}" ${hasId ? "" : "disabled"}>Delete</button>
        </div>
      </div>
    `;
    els.skillsList.appendChild(item);
  });
};

els.skillsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-skill-action]");
  if (!button) return;
  const action = button.getAttribute("data-skill-action");
  const skillId = button.getAttribute("data-skill-id") ?? "";
  const userId = els.skillUserId.value.trim();
  if (!userId) {
    setOutput("Skill Action", "User ID required. Paste it in 'User ID for Skills'.");
    return;
  }
  if (!skillId) {
    setOutput(
      "Skill Action",
      "Skill ID is unavailable in the API response. Update/Delete needs full ObjectId fields."
    );
    return;
  }
  if (action === "update") {
    els.skillUserId2.value = userId;
    els.skillId.value = skillId;
    els.skillName.value = button.getAttribute("data-skill-name") ?? "";
    els.skillProficiency.value = button.getAttribute("data-skill-proficiency") ?? "";
    setOutput("Select Skill", "Ready to update. Edit fields and click Update Skill.");
    return;
  }
  if (action === "delete") {
    try {
      const result = await request(`/skill-tracker/skill/userId/${userId}/skillId/${skillId}`, {
        method: "DELETE",
      });
      setOutput("Delete Skill", result ?? "Deleted");
      fetchSkills();
    } catch (error) {
      setOutput("Delete Skill Error", error.message);
    }
  }
});

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
