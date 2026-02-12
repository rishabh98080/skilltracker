const outputEl = document.getElementById("output");
const apiStatus = document.getElementById("apiStatus");

const state = {
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

/* ---------------- Output + Status ---------------- */

const setOutput = (label, data) => {
  const stamp = new Date().toLocaleTimeString();
  const payload =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  outputEl.textContent =
    `[${stamp}] ${label}\n${payload}\n\n` + outputEl.textContent;
};

const setStatus = (ok, message) => {
  apiStatus.textContent = message;
  apiStatus.classList.toggle("ok", ok);
  apiStatus.classList.toggle("error", !ok);
};

/* ---------------- Helpers ---------------- */

const baseUrl = () => {
  const value =
    els.baseUrl.value.trim() ||
    "https://skilltracker-production.up.railway.app";

  return value.replace(/\/$/, "");
};

const authHeader = () => {
  const username = els.username.value.trim();
  const password = els.password.value;

  if (!username || !password) return null;
  return `Basic ${btoa(`${username}:${password}`)}`;
};

const attach = (id, handler) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
};

/* ---------------- API Wrapper ---------------- */

const request = async (path, options = {}) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Attach auth unless explicitly skipped
    if (!options.skipAuth) {
      const auth = authHeader();
      if (auth) headers.Authorization = auth;
    }

    const response = await fetch(`${baseUrl()}${path}`, {
      ...options,
      headers,
    });

    const text = await response.text();

    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${data || response.statusText}`);
    }

    return data ?? response.status;
  } catch (err) {
    throw new Error(err.message || "Network Error");
  }
};

/* ---------------- ObjectId Normalizer ---------------- */

const normalizeSkillId = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value.trim();

  if (typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid.trim();
    if (typeof value.id === "string") return value.id.trim();
  }

  return "";
};

/* ---------------- Render Skills ---------------- */

const renderSkills = (skills) => {
  els.skillsList.innerHTML = "";

  if (!skills?.length) {
    els.skillsList.innerHTML = `<div class="muted">No skills found.</div>`;
    return;
  }

  skills.forEach((skill) => {
    const skillId = normalizeSkillId(skill.id ?? skill._id);

    const item = document.createElement("div");
    item.className = "skill-item";

    item.innerHTML = `
      <div class="skill-row">
        <div>
          <strong>${skill.name ?? "(no name)"}</strong><br/>
          <span class="muted">${skill.proficiency ?? ""}</span><br/>
          <span class="muted">${skillId || "ID unavailable"}</span>
        </div>

        <div class="actions">
          <button class="skill-update"
            data-skill-action="update"
            data-skill-id="${encodeURIComponent(skillId)}"
            data-skill-name="${skill.name ?? ""}"
            data-skill-proficiency="${skill.proficiency ?? ""}"
            ${skillId ? "" : "disabled"}>
            Update
          </button>

          <button class="skill-delete"
            data-skill-action="delete"
            data-skill-id="${encodeURIComponent(skillId)}"
            ${skillId ? "" : "disabled"}>
            Delete
          </button>
        </div>
      </div>
    `;

    els.skillsList.appendChild(item);
  });
};

/* ---------------- Skill Buttons ---------------- */

els.skillsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-skill-action]");
  if (!button) return;

  const action = button.dataset.skillAction;
  const skillId = decodeURIComponent(button.dataset.skillId || "").trim();
  const userId = els.skillUserId.value.trim();

  if (!userId) return setOutput("Skill Action", "User ID required");
  if (!skillId) return setOutput("Skill Action", "Skill ID missing");

  if (action === "update") {
    els.skillUserId2.value = userId;
    els.skillId.value = skillId;
    els.skillName.value = button.dataset.skillName || "";
    els.skillProficiency.value =
      button.dataset.skillProficiency || "";

    return setOutput("Select Skill", "Ready to update");
  }

  if (action === "delete") {
    try {
      await request(
        `/skill-tracker/skill/userId/${userId}/skillId/${skillId}`,
        { method: "DELETE" }
      );

      setOutput("Delete Skill", "Deleted");
      fetchSkills();
    } catch (e) {
      setOutput("Delete Skill Error", e.message);
    }
  }
});

/* ---------------- Login ---------------- */

attach("btnPing", async () => {
  try {
    const result = await request("/skill-tracker/login", {
      skipAuth: false, // login needs auth (Basic login)
    });

    setStatus(true, "API authenticated");
    setOutput("Login", result);

    if (typeof result === "string") els.userId.value = result;
    else if (result?.id) els.userId.value = result.id;

    els.skillUserId.value = els.userId.value;
    els.skillUserId2.value = els.userId.value;
  } catch (e) {
    setStatus(false, "API error");
    setOutput("Login Error", e.message);
  }
});

/* ---------------- Register ---------------- */

attach("btnRegister", async () => {
  try {
    await request("/skill-tracker/register", {
      method: "POST",
      skipAuth: true, // IMPORTANT FIX
      body: JSON.stringify({
        username: els.regUsername.value.trim(),
        password: els.regPassword.value,
      }),
    });

    setOutput("Register", "Created");
  } catch (e) {
    setOutput("Register Error", e.message);
  }
});

/* ---------------- User APIs ---------------- */

attach("btnGetUser", async () => {
  const id = els.userId.value.trim();
  if (!id) return;

  try {
    const result = await request(`/skill-tracker/user/id/${id}`);
    setOutput("Get User", result);
  } catch (e) {
    setOutput("Get User Error", e.message);
  }
});

attach("btnUpdateUser", async () => {
  const id = els.userId.value.trim();
  if (!id) return;

  try {
    await request(`/skill-tracker/user/id/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        username: els.updateUsername.value.trim(),
        password: els.updatePassword.value,
      }),
    });

    setOutput("Update User", "Updated");
  } catch (e) {
    setOutput("Update User Error", e.message);
  }
});

attach("btnDeleteUser", async () => {
  const id = els.userId.value.trim();
  if (!id) return;

  try {
    await request(`/skill-tracker/user/id/${id}`, {
      method: "DELETE",
    });

    setOutput("Delete User", "Deleted");
  } catch (e) {
    setOutput("Delete User Error", e.message);
  }
});

/* ---------------- Skill APIs ---------------- */

const fetchSkills = async () => {
  const userId = els.skillUserId.value.trim();
  if (!userId) return;

  try {
    const result = await request(`/skill-tracker/skill/id/${userId}`);
    setOutput("Fetch Skills", result);
    renderSkills(result);
  } catch (e) {
    setOutput("Fetch Skills Error", e.message);
  }
};

attach("btnGetSkills", fetchSkills);

attach("btnAddSkill", async () => {
  const userId = els.skillUserId2.value.trim();
  const name = els.skillName.value.trim();

  if (!userId || !name) return;

  try {
    await request(`/skill-tracker/skill/id/${userId}`, {
      method: "POST",
      body: JSON.stringify({
        name,
        proficiency: els.skillProficiency.value.trim(),
      }),
    });

    setOutput("Add Skill", "Created");
    fetchSkills();
  } catch (e) {
    setOutput("Add Skill Error", e.message);
  }
});

attach("btnUpdateSkill", async () => {
  const userId = els.skillUserId2.value.trim();
  const skillId = els.skillId.value.trim();

  if (!userId || !skillId) return;

  try {
    await request(
      `/skill-tracker/skill/userId/${userId}/skillId/${skillId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: els.skillName.value.trim(),
          proficiency: els.skillProficiency.value.trim(),
        }),
      }
    );

    setOutput("Update Skill", "Updated");
    fetchSkills();
  } catch (e) {
    setOutput("Update Skill Error", e.message);
  }
});

attach("btnDeleteSkill", async () => {
  const userId = els.skillUserId2.value.trim();
  const skillId = els.skillId.value.trim();

  if (!userId || !skillId) return;

  try {
    await request(
      `/skill-tracker/skill/userId/${userId}/skillId/${skillId}`,
      { method: "DELETE" }
    );

    setOutput("Delete Skill", "Deleted");
    fetchSkills();
  } catch (e) {
    setOutput("Delete Skill Error", e.message);
  }
});

/* ---------------- Auto Refresh ---------------- */

els.autoRefresh.addEventListener("change", () => {
  if (els.autoRefresh.checked) {
    if (!state.autoRefreshId) {
      state.autoRefreshId = setInterval(fetchSkills, 5000);
    }
    fetchSkills();
  } else {
    clearInterval(state.autoRefreshId);
    state.autoRefreshId = null;
  }
});
