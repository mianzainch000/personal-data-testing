<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>Meter Tracker Pro</title>
    <link
      rel="icon"
      type="image/svg+xml"
      href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%232563eb%22/><text y=%22.9em%22 font-size=%2280%22 x=%2210%22>⚡</text></svg>"
    />
    <link
      rel="apple-touch-icon"
      href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%232563eb%22/><text y=%22.9em%22 font-size=%2280%22 x=%2210%22>⚡</text></svg>"
    />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="black-translucent"
    />
    <meta name="apple-mobile-web-app-title" content="Meter Pro" />

    <style>
      /* ----- LIGHT MODE (default) ----- */
      :root,
      .theme-light {
        --primary: #2563eb;
        --success: #059669;
        --danger: #dc2626;
        --warning: #f59e0b;
        --bg: #f3f4f6;
        --text-primary: #1f2937;
        --text-secondary: #64748b;
        --text-muted: #94a3b8;
        --border-light: #e2e8f0;
        --border-lighter: #f1f5f9;
        --card-bg: #f8fafc;
        --danger-light: #fee2e2;
        --warning-light: #fff7ed;
        --info-light: #e0f2fe;
        --info-border: #7dd3fc;
        --info-text: #0369a1;
        --even-row: #fcfcfc;
        --container-bg: white;
        --tab-inactive: white;
        --tab-inactive-border: var(--border-light);
        --tab-inactive-text: var(--text-secondary);
        --input-bg: white;
        --input-border: var(--border-light);
        --table-bg: #ffffff;
        --table-border: var(--border-light);
        --table-header-bg: var(--card-bg);
        --backup-btn-bg: #fff;
        --shadow-color: rgba(0, 0, 0, 0.08);
        --mgmt-btn-bg: white;
        --stat-card-bg: var(--card-bg);
        --theme-icon: "🌞";
      }

      /* ----- DARK MODE ----- */
      .theme-dark {
        --primary: #3b82f6;
        --success: #10b981;
        --danger: #ef4444;
        --warning: #fbbf24;
        --bg: #0b1120;
        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --border-light: #334155;
        --border-lighter: #1e293b;
        --card-bg: #1e293b;
        --danger-light: #451a1a;
        --warning-light: #422006;
        --info-light: #0c4a6e;
        --info-border: #0284c7;
        --info-text: #bae6fd;
        --even-row: #1a1e2e;
        --container-bg: #0f172a;
        --tab-inactive: #1e293b;
        --tab-inactive-border: #334155;
        --tab-inactive-text: #cbd5e1;
        --input-bg: #1e293b;
        --input-border: #334155;
        --table-bg: #1e293b;
        --table-border: #334155;
        --table-header-bg: #0f172a;
        --backup-btn-bg: #1e293b;
        --shadow-color: rgba(0, 0, 0, 0.5);
        --mgmt-btn-bg: #1e293b;
        --stat-card-bg: #1e293b;
      }

      * {
        box-sizing: border-box;
        transition:
          background-color 0.2s ease,
          border-color 0.2s;
      }

      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
          Arial, sans-serif;
        background: var(--bg);
        padding: 10px;
        margin: 0;
        display: flex;
        justify-content: center;
      }

      .container {
        width: 100%;
        max-width: 500px;
        background: var(--container-bg);
        padding: 15px;
        border-radius: 20px;
        box-shadow: 0 4px 15px var(--shadow-color);
      }

      .theme-toggle-area {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 8px;
      }
      .theme-btn {
        background: var(--card-bg);
        border: 1px solid var(--border-light);
        color: var(--text-primary);
        padding: 6px 14px;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 5px var(--shadow-color);
      }

      .theme-icon {
        font-size: 1.2rem;
        line-height: 1;
      }

      .header-area {
        text-align: center;
        margin-bottom: 15px;
      }

      h2 {
        color: var(--text-primary);
        margin: 5px 0;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .management-toolbar {
        display: flex;
        gap: 6px;
        margin-bottom: 15px;
        border-bottom: 1px solid var(--border-lighter);
        padding-bottom: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .mgmt-btn {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid var(--border-light);
        cursor: pointer;
        font-size: 11px;
        font-weight: 700;
        background: var(--mgmt-btn-bg);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .mgmt-btn.primary {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      .mgmt-btn.danger {
        background: var(--danger-light);
        color: var(--danger);
        border-color: #fecaca;
      }

      .mgmt-btn.warning {
        background: var(--warning-light);
        color: var(--warning);
        border-color: #ffedd5;
      }

      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        overflow-x: auto;
        padding: 4px;
        scrollbar-width: none;
      }

      .tab-btn {
        flex: 1 1 auto;
        min-width: 120px;
        padding: 14px 10px;
        border: 2px solid var(--tab-inactive-border);
        border-radius: 12px;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.95rem;
        background: var(--tab-inactive);
        color: var(--tab-inactive-text);
        text-align: center;
      }

      .tab-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      }

      .input-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;
      }

      input {
        width: 100%;
        padding: 15px;
        border: 2px solid var(--input-border);
        border-radius: 12px;
        font-size: 1.2rem;
        outline: none;
        text-align: center;
        background: var(--input-bg);
        color: var(--text-primary);
      }

      input:focus {
        border-color: var(--primary);
      }

      .add-btn {
        width: 100%;
        padding: 15px;
        background: var(--success);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
      }

      .add-btn:hover {
        opacity: 0.9;
      }

      .stats-grid {
        display: none;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 20px;
      }

      .stat-card {
        background: var(--stat-card-bg);
        padding: 12px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid var(--border-lighter);
        color: var(--text-secondary);
      }

      .stat-val {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--primary);
      }

      .stat-card.monthly {
        grid-column: span 2;
        background: var(--info-light);
        border: 1px dashed var(--primary);
      }

      .stat-val.monthly {
        color: var(--warning);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        background: var(--table-bg);
        border: 1px solid var(--table-border);
        border-radius: 8px;
      }

      th {
        background: var(--table-header-bg);
        text-align: center;
        padding: 12px 4px;
        border: 1px solid var(--border-light);
        color: var(--text-secondary);
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      td {
        padding: 12px 4px;
        border: 1px solid var(--border-light);
        font-size: 0.9rem;
        text-align: center;
        vertical-align: middle;
        color: var(--text-primary);
      }

      th:nth-child(1),
      td:nth-child(1) {
        text-align: left;
        padding-left: 8px;
        white-space: nowrap;
        font-weight: 500;
      }

      .full-text {
        display: inline;
      }

      .short-text {
        display: none;
      }

      .base-badge {
        font-size: 9px;
        margin-top: 2px;
        color: var(--primary);
        display: block;
      }

      tr:nth-child(even) {
        background-color: var(--even-row);
      }

      .action-btns {
        display: flex;
        justify-content: space-around;
      }
      .edit-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        background: #fffbeb;
        color: var(--warning);
      }

      .del-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        background: #fef2f2;
        color: var(--danger);
      }

      .backup-zone {
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px dashed var(--border-light);
      }

      .backup-btns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .b-btn {
        padding: 12px;
        border-radius: 10px;
        border: 1px solid var(--border-light);
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        background: var(--backup-btn-bg);
        color: var(--text-secondary);
      }

      .b-btn.success {
        background: var(--success);
        color: white;
        border-color: var(--success);
      }

      .empty-state {
        display: none;
        text-align: center;
        padding: 50px;
        color: var(--text-muted);
        border: 2px dashed var(--border-light);
        border-radius: 15px;
      }

      .empty-state .add-btn {
        width: auto;
        padding: 10px 20px;
      }

      .locked-badge {
        color: var(--text-muted);
        font-size: 11px;
        font-weight: bold;
      }

      .days-text {
        color: var(--text-secondary);
      }

      .units-text.normal {
        color: var(--danger);
      }

      .avg-text.normal {
        color: var(--primary);
        font-weight: 600;
      }

      .avg-text.base {
        color: var(--text-muted);
      }

      .units-text.base {
        color: var(--text-muted);
      }

      .backup-note {
        font-size: 10px;
        color: var(--text-muted);
        text-align: center;
        margin-top: 8px;
      }

      #lockScreen {
        backdrop-filter: blur(10px);
        background: rgba(11, 17, 32, 0.8) !important;
        transition: all 0.3s ease;
      }

      .lock-card {
        background: var(--container-bg);
        padding: 30px;
        border-radius: 24px;
        box-shadow: 0 10px 30px var(--shadow-color);
        text-align: center;
        width: 90%;
        max-width: 320px;
        border: 1px solid var(--border-light);
      }

      .lock-card h2 {
        font-size: 1.5rem;
        margin-bottom: 20px;
        color: var(--text-primary);
      }

      .pin-field {
        letter-spacing: 10px;
        font-size: 1.8rem !important;
        font-weight: bold;
        margin-bottom: 15px;
        border: 2px solid var(--border-light) !important;
      }

      .unlock-btn {
        background: var(--primary) !important;
        color: white !important;
        width: 100%;
        padding: 12px !important;
        font-size: 1rem !important;
        border-radius: 12px !important;
        border: none;
        cursor: pointer;
        font-weight: bold;
        margin-bottom: 10px;
        transition: transform 0.1s;
      }

      .unlock-btn:active {
        transform: scale(0.98);
      }

      .forgot-btn {
        background: transparent !important;
        color: var(--text-secondary) !important;
        font-size: 0.85rem !important;
        border: none !important;
        cursor: pointer;
        text-decoration: underline;
      }

      #pinError {
        background: var(--danger-light);
        color: var(--danger);
        padding: 8px;
        border-radius: 8px;
        font-size: 13px;
        margin-top: 10px;
      }

      @media screen and (max-width: 480px) {
        td,
        th {
          padding: 8px 2px;
          font-size: 0.8rem;
        }

        .edit-btn,
        .del-btn {
          padding: 6px 8px;
        }

        .full-text {
          display: none;
        }

        .short-text {
          display: inline;
        }
        th {
          font-size: 0.65rem;
        }
      }
    </style>

  </head>
  <body class="theme-light">
    <div
      id="lockScreen"
      style="
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        flex-direction: column;
      "
    >
      <div class="lock-card">
        <h2>🔐 Enter PIN</h2>
        <input
          type="password"
          id="pinInput"
          class="pin-field"
          placeholder="****"
          maxlength="4"
          inputmode="numeric"
        />
        <button class="unlock-btn" onclick="unlockApp()">Unlock App</button>
        <!-- <button class="forgot-btn" onclick="resetPin()">Forgot PIN?</button> -->
        <p id="pinError" style="display: none">❌ Wrong PIN. Try again.</p>
      </div>
    </div>

    <div class="container">
      <div class="theme-toggle-area">
        <button id="themeToggleBtn" class="theme-btn" onclick="toggleTheme()">
          <span id="themeIcon" class="theme-icon">🌞</span>
          <span id="themeLabel">Light</span>
        </button>
      </div>

      <div class="management-toolbar">
        <button class="mgmt-btn primary" onclick="addNewMeter()">
          ➕ Add Meter
        </button>
        <button
          id="renameBtn"
          class="mgmt-btn"
          style="display: none"
          onclick="renameCurrentMeter()"
        >
          ✎ Rename
        </button>
        <button
          id="resetDataBtn"
          class="mgmt-btn warning"
          style="display: none"
          onclick="resetCurrentMeterData()"
        >
          🔄 Reset
        </button>
        <button
          id="deleteBtn"
          class="mgmt-btn danger"
          style="display: none"
          onclick="deleteCurrentMeter()"
        >
          ✕ Delete
        </button>
      </div>

      <div class="header-area">
        <h2 id="title">⚡ No Meter</h2>
      </div>
      <div class="tabs" id="meterTabs"></div>

      <div id="mainUI" style="display: none">
        <div class="input-block">
          <input
            type="number"
            id="readingInput"
            placeholder="Enter New Reading"
          />
          <button class="add-btn" onclick="addReading()">SAVE READING</button>
        </div>

        <div class="stats-grid" id="statsGrid">
          <div class="stat-card">
            <small>Total Units</small>
            <div id="totalUnits" class="stat-val">0</div>
          </div>
          <div class="stat-card">
            <small>Last Reading</small>
            <div id="lastReading" class="stat-val">0</div>
          </div>
          <div class="stat-card monthly">
            <small>📅 Estimated Monthly Units</small>
            <div id="monthlyEstimate" class="stat-val monthly">0</div>
          </div>
        </div>

        <table id="historyTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>
                <span class="full-text">READING</span
                ><span class="short-text">RDG</span>
              </th>
              <th>
                <span class="full-text">DAYS</span
                ><span class="short-text">DYS</span>
              </th>
              <th>
                <span class="full-text">UNITS</span
                ><span class="short-text">UNT</span>
              </th>
              <th>
                <span class="full-text">AVG</span
                ><span class="short-text">AVG</span>
              </th>
              <th>
                <span class="full-text">ACTIONS</span
                ><span class="short-text">ACT</span>
              </th>
            </tr>
          </thead>
          <tbody id="historyBody"></tbody>
        </table>

        <div class="backup-zone">
          <div class="backup-btns">
            <button class="b-btn success" onclick="exportFullBackup()">
              📥 BACKUP
            </button>
            <button class="b-btn" onclick="importFullBackupPrompt()">
              📂 RESTORE
            </button>
          </div>
          <p class="backup-note">Full Backup saves ALL meters in one file</p>
        </div>
      </div>

      <div class="empty-state" id="emptyState">
        <p>Meter list is empty.</p>
        <button class="add-btn" onclick="importFullBackupPrompt()">
          RESTORE BACKUP
        </button>
      </div>

      <input
        type="file"
        id="fileInput"
        style="display: none"
        onchange="handleFileUpload(event)"
        accept=".json"
      />
    </div>

    <script>
      function setPin() {
        const pin = prompt("Set a 4-digit PIN:");

        if (!/^\d{4}$/.test(pin)) {
          alert("❌ PIN must be exactly 4 digits!");
          return;
        }

        localStorage.setItem("app_pin", pin);
        alert("✅ PIN set successfully!");
      }

      function unlockApp() {
        const savedPin = localStorage.getItem("app_pin");
        const inputEl = document.getElementById("pinInput");
        const entered = inputEl.value.trim();

        if (!/^\d{4}$/.test(entered)) {
          document.getElementById("pinError").innerText =
            "❌ Enter valid 4-digit PIN";
          document.getElementById("pinError").style.display = "block";
          return;
        }

        if (!savedPin) {
          localStorage.setItem("app_pin", entered);
          sessionStorage.setItem("unlocked", "true");
          hideLock();
          return;
        }

        if (entered === savedPin) {
          sessionStorage.setItem("unlocked", "true");
          hideLock();
        } else {
          document.getElementById("pinError").innerText =
            "❌ Wrong PIN. Try again.";
          document.getElementById("pinError").style.display = "block";
        }
      }

      function hideLock() {
        document.getElementById("lockScreen").style.display = "none";
        document.getElementById("mainUI").style.display = "block";
      }

      function lockNow() {
        sessionStorage.removeItem("unlocked");
        document.getElementById("lockScreen").style.display = "flex";
      }

      (function checkLock() {
        const pin = localStorage.getItem("app_pin");
        const unlocked = sessionStorage.getItem("unlocked");

        if (!pin) {
          setTimeout(() => {
            setPin();
          }, 300);
          return;
        }

        if (unlocked === "true") {
          hideLock();
        }
      })();

      function resetPin() {
        const confirmReset = confirm(
          "⚠️ PIN reset karne se app unlock ho jayegi. Continue?",
        );

        if (!confirmReset) return;

        localStorage.removeItem("app_pin");
        sessionStorage.removeItem("unlocked");

        alert("PIN removed. Set new PIN.");

        location.reload();
      }

      function updateThemeButton() {
        const isDark = document.body.classList.contains("theme-dark");
        const iconSpan = document.getElementById("themeIcon");
        const labelSpan = document.getElementById("themeLabel");
        if (isDark) {
          iconSpan.textContent = "🌙";
          labelSpan.textContent = "Dark";
        } else {
          iconSpan.textContent = "🌞";
          labelSpan.textContent = "Light";
        }
      }

      function toggleTheme() {
        const body = document.body;
        if (body.classList.contains("theme-light")) {
          body.classList.remove("theme-light");
          body.classList.add("theme-dark");
          localStorage.setItem("meter_tracker_theme", "dark");
        } else {
          body.classList.remove("theme-dark");
          body.classList.add("theme-light");
          localStorage.setItem("meter_tracker_theme", "light");
        }
        updateThemeButton();
      }

      (function loadThemeAndButton() {
        const saved = localStorage.getItem("meter_tracker_theme");
        const body = document.body;
        body.classList.remove("theme-light", "theme-dark");
        if (saved === "dark") {
          body.classList.add("theme-dark");
        } else {
          body.classList.add("theme-light");
        }
        updateThemeButton();
      })();

      let data = JSON.parse(localStorage.getItem("meter_tracker_v3")) || {
        meters: [],
        activeMeterId: null,
      };

      function saveState() {
        localStorage.setItem("meter_tracker_v3", JSON.stringify(data));
      }

      function getActiveMeter() {
        return data.meters.find((m) => m.id === data.activeMeterId);
      }

      function calculateMonthlyEstimate() {
        const meter = getActiveMeter();
        if (!meter || meter.readings.length < 2) return 0;

        const currentYear = new Date().getFullYear();
        const bDay = meter.billingDate || 1;

        const baseReading = meter.readings[0];
        const lastReading = meter.readings[meter.readings.length - 1];

        const d1 = new Date(baseReading.date + " " + currentYear);
        d1.setHours(0, 0, 0, 0);

        const d2 = new Date(lastReading.date + " " + currentYear);
        d2.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(d2 - d1);
        const daysPassed = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const nextCycleDate = new Date(
          d1.getFullYear(),
          d1.getMonth() + 1,
          bDay,
        );
        nextCycleDate.setHours(0, 0, 0, 0);

        const totalDaysInCycle = Math.round(
          (nextCycleDate - d1) / (1000 * 60 * 60 * 24),
        );

        const unitsGained = lastReading.current - baseReading.current;

        if (daysPassed <= 0) return 0;

        const estimate = (unitsGained / daysPassed) * totalDaysInCycle;

        return Math.round(estimate);
      }

      function renderTabs() {
        const tabsContainer = document.getElementById("meterTabs");
        const emptyState = document.getElementById("emptyState");
        const mainUI = document.getElementById("mainUI");
        const title = document.getElementById("title");
        const btns = ["renameBtn", "deleteBtn", "resetDataBtn"];

        tabsContainer.innerHTML = "";
        if (data.meters.length === 0) {
          emptyState.style.display = "block";
          mainUI.style.display = "none";
          btns.forEach(
            (id) => (document.getElementById(id).style.display = "none"),
          );
          title.innerText = "⚡ No Meter";
          return;
        }
        emptyState.style.display = "none";
        mainUI.style.display = "block";
        btns.forEach(
          (id) => (document.getElementById(id).style.display = "flex"),
        );

        data.meters.forEach((meter) => {
          const btn = document.createElement("button");
          btn.className = `tab-btn ${meter.id === data.activeMeterId ? "active" : ""}`;
          btn.innerText = meter.name;
          btn.onclick = () => {
            data.activeMeterId = meter.id;
            saveState();
            renderTabs();
            renderReadings();
          };
          tabsContainer.appendChild(btn);
        });
        const activeMeter = getActiveMeter();
        if (activeMeter) title.innerText = `⚡ ${activeMeter.name}`;
      }

      function addNewMeter() {
        const name = prompt("Meter Name (e.g. Home, Shop):");
        if (!name) return;

        const bDate = prompt("Billing Cycle Start Day (1-31):", "1");
        const cycleDay = parseInt(bDate);

        if (isNaN(cycleDay) || cycleDay < 1 || cycleDay > 31) {
          alert("Please enter a valid day between 1 and 31");
          return;
        }

        const id = "m_" + Date.now();
        data.meters.push({
          id,
          name,
          billingDate: cycleDay,
          readings: [],
        });

        data.activeMeterId = id;
        saveState();
        renderTabs();
        renderReadings();
      }

      function addReading() {
        const input = document.getElementById("readingInput");
        const val = Math.round(parseFloat(input.value));
        if (isNaN(val)) return;

        const meter = getActiveMeter();
        const todayStr = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });

        const existingIndex = meter.readings.findIndex(
          (r) => r.date === todayStr,
        );

        if (existingIndex !== -1) {
          if (existingIndex > 0) {
            const prevEntry = meter.readings[existingIndex - 1];
            if (val < prevEntry.current) {
              alert(
                `❌ Reading (${val}) pichli reading (${prevEntry.current}) se kam nahi ho sakti.`,
              );
              return;
            }
          }
          meter.readings[existingIndex].current = val;
        } else {
          const lastEntry = meter.readings[meter.readings.length - 1];
          if (lastEntry && val < lastEntry.current) {
            alert(
              `❌ Reading (${val}) pichli reading (${lastEntry.current}) se kam nahi ho sakti.`,
            );
            return;
          }
          meter.readings.push({ current: val, units: 0, date: todayStr });
        }
        recalculateAndSave();
        input.value = "";
      }

      function recalculateAndSave() {
        const meter = getActiveMeter();
        if (!meter || meter.readings.length === 0) return;

        const currentYear = new Date().getFullYear();
        const bDay = meter.billingDate || 1;
        meter.readings.sort((a, b) => {
          return (
            new Date(a.date + " " + currentYear) -
            new Date(b.date + " " + currentYear)
          );
        });

        meter.readings.forEach((r, i) => {
          const rDateObj = new Date(r.date + " " + currentYear);

          r.isBillingBase = rDateObj.getDate() === bDay;

          if (i === 0) {
            r.units = 0;
            r.days = 0;
            r.avg = 0;
          } else {
            const prev = meter.readings[i - 1];
            r.units = r.current - prev.current;

            const d1 = new Date(prev.date + " " + currentYear);
            const d2 = rDateObj;
            const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

            r.days = diffDays > 0 ? diffDays : 0;
            r.avg = r.days > 0 ? (r.units / r.days).toFixed(2) : 0;
          }
        });

        saveState();
        renderReadings();
      }

      function renderReadings() {
        const meter = getActiveMeter();
        const table = document.getElementById("historyTable");
        const stats = document.getElementById("statsGrid");
        if (!meter || meter.readings.length === 0) {
          table.style.display = "none";
          stats.style.display = "none";
          return;
        }
        table.style.display = "table";
        stats.style.display = "grid";

        const total = meter.readings.reduce((s, i) => s + i.units, 0);
        document.getElementById("totalUnits").innerText = Math.round(total);
        document.getElementById("lastReading").innerText =
          meter.readings[meter.readings.length - 1].current;
        document.getElementById("monthlyEstimate").innerText =
          calculateMonthlyEstimate();

        const tbody = document.getElementById("historyBody");
        tbody.innerHTML = meter.readings
          .map((item, index) => {
            const isBase = index === 0;
            const avgValue = isBase ? "-" : item.avg;
            const unitsClass = isBase ? "units-text base" : "units-text normal";
            const avgClass = isBase ? "avg-text base" : "avg-text normal";
            return `<tr>
          <td><span>${item.date}</span>${isBase ? '<br><span class="base-badge">BASE</span>' : ""}</td>
          <td><b>${item.current}</b></td>
          <td class="days-text">${isBase ? "-" : item.days + " d"}</td>
          <td class="${unitsClass}">${isBase ? "-" : "+" + item.units}</td>
          <td class="${avgClass}">${avgValue}</td>
          <td><div class="action-btns">${
            index === meter.readings.length - 1
              ? `<button class="edit-btn" onclick="editReading(${index})">✎</button><button class="del-btn" onclick="deleteReading(${index})">✕</button>`
              : '<span class="locked-badge">🔒 LOCKED</span>'
          }</div></td>
        </tr>`;
          })
          .reverse()
          .join("");
      }
      function editReading(index) {
        const meter = getActiveMeter();
        const entry = meter.readings[index];

        const newVal = prompt("Edit Reading:", entry.current);
        if (newVal === null) return;

        const updatedVal = Math.round(parseFloat(newVal));
        if (isNaN(updatedVal)) return;

        const newDateInput = prompt("Edit Date (e.g. 14 Mar):", entry.date);

        if (newDateInput !== null && newDateInput.trim() !== "") {
          let rawDate = newDateInput.trim();
          const currentYear = new Date().getFullYear();

          const dateParts = rawDate.match(/(\d+)\s+([a-zA-Z]+)/);
          if (!dateParts) {
            alert("❌ Ghalat format! Use '14 Mar'");
            return;
          }

          const day = dateParts[1];
          const month = dateParts[2].substring(0, 3);
          const formattedDate = `${day} ${month}`;

          const tempDateObj = new Date(formattedDate + " " + currentYear);
          tempDateObj.setHours(0, 0, 0, 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (tempDateObj > today) {
            alert("❌ Future date allowed nahi hai!");
            return;
          }

          const duplicateIndex = meter.readings.findIndex(
            (r, i) => r.date === formattedDate && i !== index,
          );

          if (duplicateIndex !== -1) {
            meter.readings[duplicateIndex].current = updatedVal;

            meter.readings.splice(index, 1);

            recalculateAndSave();
            renderTabs();
            return;
          }

          for (let i = 0; i < meter.readings.length; i++) {
            if (i === index) continue;

            const other = meter.readings[i];
            const otherDate = new Date(other.date + " " + currentYear);
            otherDate.setHours(0, 0, 0, 0);

            if (otherDate < tempDateObj && updatedVal < other.current) {
              alert(
                `❌ Invalid! ${other.date} ki reading (${other.current}) is se zyada hai.`,
              );
              return;
            }

            if (otherDate > tempDateObj && updatedVal > other.current) {
              alert(
                `❌ Invalid! Agli date (${other.date}) ki reading is se kam hai.`,
              );
              return;
            }
          }

          entry.date = formattedDate;

          if (index === 0) {
            meter.billingDate = parseInt(day);
          }
        }

        entry.current = updatedVal;

        recalculateAndSave();
        renderTabs();
      }
      function deleteReading(index) {
        const meter = getActiveMeter();

        if (confirm("Kya aap waqai is entry ko delete karna chahte hain?")) {
          meter.readings.splice(index, 1);

          if (meter.readings.length === 0) {
            saveState();
            renderReadings();
            return;
          }

          recalculateAndSave();
        }
      }

      function exportFullBackup() {
        if (data.meters.length === 0) {
          alert("No meters to backup!");
          return;
        }
        const backupData = {
          version: "v3",
          exportDate: new Date().toISOString(),
          meters: data.meters,
          activeMeterId: data.activeMeterId,
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `meter_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
      }

      function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            if (json.version === "v3" && Array.isArray(json.meters)) {
              if (
                confirm(
                  `Replace all existing meters with backup containing ${json.meters.length} meters?`,
                )
              ) {
                data.meters = json.meters;
                data.activeMeterId =
                  json.activeMeterId || json.meters[0]?.id || null;
                saveState();
                renderTabs();
                renderReadings();
                alert(`✅ Restored ${json.meters.length} meters successfully!`);
              }
            } else if (Array.isArray(json.readings)) {
              const newId = "m_" + Date.now();
              data.meters.push({
                id: newId,
                name: "Imported Meter",
                readings: json.readings,
              });
              data.activeMeterId = newId;
              saveState();
              renderTabs();
              renderReadings();
              alert(`✅ Created new meter with imported data!`);
            } else {
              alert("❌ Invalid backup file format.");
            }
          } catch (err) {
            alert("❌ File error: " + err.message);
          }
        };
        reader.readAsText(file);
        event.target.value = "";
      }

      function importFullBackupPrompt() {
        document.getElementById("fileInput").click();
      }

      function renameCurrentMeter() {
        const m = getActiveMeter();
        if (!m) return;

        const newName = prompt("Enter new Meter Name:", m.name);
        if (newName === null) return;

        const newCycleDay = prompt(
          "Update Cycle Day (1-31):",
          m.billingDate || 1,
        );
        if (newCycleDay === null) return;

        const cycleDayNum = parseInt(newCycleDay);
        if (isNaN(cycleDayNum) || cycleDayNum < 1 || cycleDayNum > 31) {
          alert("Invalid Day!");
          return;
        }

        m.name = newName;
        m.billingDate = cycleDayNum;

        if (m.readings.length > 0) {
          const firstReading = m.readings[0];
          const parts = firstReading.date.split(" ");
          const month = parts[1] || "";
          firstReading.date = `${cycleDayNum} ${month}`;
        }

        saveState();
        recalculateAndSave();
        renderTabs();
        renderReadings();
        alert("Meter & Base Date synced!");
      }

      function resetCurrentMeterData() {
        const m = getActiveMeter();
        if (m && confirm("Clear all readings for this meter?")) {
          m.readings = [];
          saveState();
          renderReadings();
        }
      }

      function deleteCurrentMeter() {
        if (!data.activeMeterId) return;

        const m = getActiveMeter();

        if (
          confirm(
            `Kya aap "${m.name}" aur iska sara data delete karna chahte hain?`,
          )
        ) {
          data.meters = data.meters.filter(
            (meter) => meter.id !== data.activeMeterId,
          );

          if (data.meters.length > 0) {
            data.activeMeterId = data.meters[0].id;
          } else {
            data.activeMeterId = null;
          }

          saveState();
          renderTabs();
          renderReadings();
          alert("Meter deleted successfully!");
        }
      }

      renderTabs();
      renderReadings();
    </script>

  </body>
</html>
