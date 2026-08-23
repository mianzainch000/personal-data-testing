<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Food Calorie Tracker by Day</title>
    <style>
      :root {
        --bg: #f7f9fc;
        --card: #ffffff;
        --accent: #0b74de;
        --muted: #6b7280;
        --edit: #4caf50;
        --delete: #f44336;
      }
      * {
        box-sizing: border-box;
        font-family: Inter, system-ui, sans-serif;
      }
      body {
        margin: 16px;
        background: var(--bg);
        color: #111;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }
      h1 {
        font-size: 26px;
        margin: 0;
      }
      .small {
        font-size: 14px;
        color: var(--muted);
      }
      .card {
        background: var(--card);
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(16, 24, 40, 0.06);
        margin-bottom: 12px;
      }
      form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      form > div {
        display: flex;
        flex-direction: column;
      }
      label {
        display: block;
        font-size: 14px;
        color: var(--muted);
        margin-bottom: 6px;
      }
      input,
      select {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #e6e9ef;
        font-size: 14px;
      }
      .actions {
        grid-column: 1/-1;
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
      .actions button {
        flex: 1;
        padding: 10px;
        font-size: 14px;
        border-radius: 8px;
        border: 0;
        cursor: pointer;
        color: #fff;
        background: var(--accent);
        transition: 0.3s;
      }
      .actions button:hover {
        background: #095bb5;
      }
      .day-column {
        background: #fff;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(16, 24, 40, 0.1);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .day-column h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: var(--accent);
        text-align: center;
      }
      .total-cal {
        font-weight: 700;
        font-size: 16px;
        text-align: center;
        color: #111;
        margin-bottom: 8px;
      }
      .item {
        font-size: 15px;
        padding: 10px;
        border-radius: 8px;
        background: #f0f2f5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: 0.3s;
      }
      .item span {
        margin-right: 8px;
      }
      .item button {
        border: none;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        color: #fff;
        transition: 0.3s;
      }
      .item button.edit {
        background: var(--edit);
      }
      .item button.edit:hover {
        background: #388e3c;
      }
      .item button.delete {
        background: var(--delete);
      }
      .item button.delete:hover {
        background: #d32f2f;
      }
      @media (max-width: 480px) {
        form {
          grid-template-columns: 1fr;
        }
        .item {
          flex-direction: column;
          align-items: flex-start;
        }
        .item span {
          margin-bottom: 4px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>Food Calorie Tracker by Day</h1>
        <div class="small">
          Select a day and add food items; total calories for that day are shown
          below.
        </div>
      </header>

      <section class="card">
        <form id="foodForm">
          <div>
            <label for="day">Select Day</label>
            <select id="day">
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div>
            <label for="name">Food Item</label>
            <input type="text" id="name" placeholder="e.g. Roti" required />
          </div>
          <div>
            <label for="cal">Calories (kcal)</label>
            <input
              type="number"
              id="cal"
              min="0"
              step="1"
              placeholder="e.g. 300"
              required
            />
          </div>
          <div>
            <label for="meal">Meal Time</label>
            <select id="meal">
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snack">Snack</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          <div class="actions">
            <button type="submit">Add</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="day-column" id="dayColumn">
          <h3 id="dayTitle">Monday</h3>
          <div class="total-cal" id="totalCal">Total: 0 kcal</div>
          <div id="itemsContainer"></div>
        </div>
      </section>
    </div>

    <script>
      const foodForm = document.getElementById("foodForm");
      const nameIn = document.getElementById("name");
      const calIn = document.getElementById("cal");
      const mealIn = document.getElementById("meal");
      const dayIn = document.getElementById("day");
      const itemsContainer = document.getElementById("itemsContainer");
      const totalCalEl = document.getElementById("totalCal");
      const dayTitle = document.getElementById("dayTitle");

      // Load foods from localStorage
      let foods = [];
      const savedFoods = localStorage.getItem("foods_by_day_buttons");
      if (savedFoods) {
        try {
          foods = JSON.parse(savedFoods);
        } catch (e) {
          foods = [];
        }
      }

      function save() {
        localStorage.setItem("foods_by_day_buttons", JSON.stringify(foods));
      }
      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function render() {
        const selectedDay = dayIn.value;
        dayTitle.textContent = selectedDay;
        itemsContainer.innerHTML = "";
        let total = 0;
        foods
          .filter((f) => f.day === selectedDay)
          .forEach((f) => {
            total += f.cal;
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.innerHTML = `<span>${escapeHtml(f.name)} (${
              f.cal
            } kcal) ${escapeHtml(f.meal)}</span>
      <span>
        <button class="edit" onclick="editItem('${f.id}')">Edit</button>
        <button class="delete" onclick="deleteItem('${f.id}')">Delete</button>
      </span>`;
            itemsContainer.appendChild(itemDiv);
          });
        totalCalEl.textContent = `Total: ${total} kcal`;
        save();
      }

      foodForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nameIn.value.trim();
        const cal = Number(calIn.value);
        const meal = mealIn.value;
        const day = dayIn.value;
        if (!name || isNaN(cal)) return alert("Enter valid data");
        const id = Date.now().toString(); // unique id
        foods.push({
          id,
          name,
          cal,
          meal,
          day,
          created: new Date().toISOString(),
        });
        nameIn.value = "";
        calIn.value = "";
        mealIn.value = "Breakfast";
        render();
      });

      window.deleteItem = function (id) {
        if (!confirm("Delete this item?")) return;
        foods = foods.filter((f) => f.id !== id);
        render();
      };

      window.editItem = function (id) {
        const f = foods.find((f) => f.id === id);
        if (!f) return;
        nameIn.value = f.name;
        calIn.value = f.cal;
        mealIn.value = f.meal;
        dayIn.value = f.day;
        foods = foods.filter((f) => f.id !== id); // remove before edit
        render();
      };

      dayIn.addEventListener("change", render);

      // Initial render
      render();
    </script>

  </body>
</html>
