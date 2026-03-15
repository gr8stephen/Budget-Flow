      /* -------------------------------------------------------
       DATA: Spending trends (6 months)
       Format: { labels, income[], expenses[] }
    ------------------------------------------------------- */
      const trendData = {
        labels: [],
        income: [],
        expenses: [],
      };

      /* -------------------------------------------------------
       DATA: Category breakdown
    ------------------------------------------------------- */
      const categories = [];

      /* -------------------------------------------------------
       DATA: Recent transactions
       type: food | transport | income | shopping | health
    ------------------------------------------------------- */
      const transactions = [];

      /* -------------------------------------------------------
       CHART.JS GLOBAL DEFAULTS
    ------------------------------------------------------- */
      Chart.defaults.color = "#7a8ec2";
      Chart.defaults.font.family = "'DM Sans', sans-serif";

      /* -------------------------------------------------------
       SPENDING TRENDS — Line Chart
    ------------------------------------------------------- */
      (function buildTrendChart() {
        const ctx = document.getElementById("trendChart").getContext("2d");

        // Create gradient fills for the two lines
        const gradExpenses = ctx.createLinearGradient(0, 0, 0, 220);
        gradExpenses.addColorStop(0, "rgba(255,77,109,0.3)");
        gradExpenses.addColorStop(1, "rgba(255,77,109,0)");

        const gradIncome = ctx.createLinearGradient(0, 0, 0, 220);
        gradIncome.addColorStop(0, "rgba(0,229,160,0.3)");
        gradIncome.addColorStop(1, "rgba(0,229,160,0)");

        new Chart(ctx, {
          type: "line",
          data: {
            labels: trendData.labels,
            datasets: [
              {
                label: "Expenses",
                data: trendData.expenses,
                borderColor: "#ff4d6d",
                backgroundColor: gradExpenses,
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#ff4d6d",
                fill: true,
                tension: 0.4 /* smooth bezier curve */,
              },
              {
                label: "Income",
                data: trendData.income,
                borderColor: "#00e5a0",
                backgroundColor: gradIncome,
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#00e5a0",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: { display: false } /* custom legend in HTML */,
              tooltip: {
                backgroundColor: "#162050",
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                padding: 10,
                titleColor: "#e8eeff",
                bodyColor: "#7a8ec2",
                callbacks: {
                  label: (ctx) => ` ¢${ctx.parsed.y.toLocaleString()}`,
                },
              },
            },
            scales: {
              x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { color: "#4a5a8a" },
              },
              y: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: {
                  color: "#4a5a8a",
                  callback: (v) => "¢" + v.toLocaleString(),
                },
                beginAtZero: true,
              },
            },
          },
        });
      })();

      /* -------------------------------------------------------
       CATEGORY DONUT — Doughnut Chart
    ------------------------------------------------------- */
      (function buildDonutChart() {
        const ctx = document.getElementById("donutChart").getContext("2d");

        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: categories.map((c) => c.name),
            datasets: [
              {
                data: categories.map((c) => c.amount),
                backgroundColor: categories.map((c) => c.color),
                borderWidth: 3,
                borderColor: "#162050",
                hoverOffset: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%" /* controls the donut hole size */,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "#162050",
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: (ctx) => ` ¢${ctx.parsed.toFixed(2)}`,
                },
              },
            },
          },
        });
      })();

      /* -------------------------------------------------------
       CATEGORY LIST (right-hand side breakdown)
    ------------------------------------------------------- */
      (function buildCategoryList() {
        const ul = document.getElementById("categoryList");
        categories.forEach((cat) => {
          const li = document.createElement("li");
          li.className = "category-item";
          li.innerHTML = `
          <span class="cat-dot" style="background:${cat.color}"></span>
          <span class="cat-name">${cat.name}</span>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width:0; background:${cat.color}" data-pct="${cat.pct}"></div>
          </div>
          <span class="cat-amount">-¢${cat.amount.toFixed(2)}</span>
        `;
          ul.appendChild(li);
        });

        /* Animate bars after a short delay (visibility) */
        setTimeout(() => {
          document.querySelectorAll(".cat-bar-fill").forEach((bar) => {
            bar.style.width = bar.dataset.pct + "%";
          });
        }, 300);
      })();

      /* -------------------------------------------------------
       TRANSACTION LIST
    ------------------------------------------------------- */
      (function buildTransactionList() {
        const container = document.getElementById("transactionList");
        transactions.forEach((tx, i) => {
          const isPositive = tx.amount > 0;
          const amountStr =
            (isPositive ? "+" : "-") + "¢" + Math.abs(tx.amount).toFixed(2);

          const row = document.createElement("div");
          row.className = "transaction-row";
          row.style.animationDelay = i * 0.07 + "s"; /* stagger animation */

          row.innerHTML = `
          <div class="tx-icon ${tx.type}">${tx.icon}</div>
          <div class="tx-details">
            <div class="tx-name">${tx.name}</div>
            <div class="tx-category">${tx.cat}</div>
          </div>
          <div class="tx-date">${tx.date}</div>
          <div class="tx-amount ${isPositive ? "positive" : "negative"}">${amountStr}</div>
        `;
          container.appendChild(row);
        });
      })();

      /* -------------------------------------------------------
       FILTER CONTROLS: Weekly / Monthly / Yearly toggle
    ------------------------------------------------------- */
function setView(mode) {

  const buttons = document.querySelectorAll(".toggle-btn");

  buttons.forEach(btn => {
    btn.classList.remove("active");
  });

  if (mode === "weekly") {
    document.getElementById("btnWeekly").classList.add("active");
  }

  if (mode === "monthly") {
    document.getElementById("btnMonthly").classList.add("active");
  }

  if (mode === "yearly") {
    document.getElementById("btnYearly").classList.add("active");
  }

}

      /* -------------------------------------------------------
       FILTER CONTROLS: Cycle month demo
    ------------------------------------------------------- */
      const months = [
        "January 2026",
        "February 2026",
        "March 2026",
        "April 2026",
        "May 2026",
        "June 2026",
        "July 2026",
        "August 2026",
        "September 2026",
        "October 2026",
        "November 2026",
        "December 2026",
      ];
      let monthIndex = 9; /* October */

      function cycleMonth() {
        monthIndex = (monthIndex + 1) % months.length;
        document.getElementById("selectedMonth").childNodes[0].textContent =
          months[monthIndex] + " ";
      }

      /* -------------------------------------------------------
       FILTER CONTROLS: Cycle category demo
    ------------------------------------------------------- */
      const catOptions = [
        "All Categories",
        "Food & Drinks",
        "Transport",
        "Shopping",
        "Health",
        "Utilities",
      ];
      let catIndex = 0;

      function cycleCategory() {
        catIndex = (catIndex + 1) % catOptions.length;
        document.getElementById("selectedCategory").childNodes[0].textContent =
          catOptions[catIndex] + " ";
      }

      /* -------------------------------------------------------
      SELECT CURRENT MONTH
    ------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", function () {

  const monthDropdown = document.getElementById("monthSelect");

  const currentMonth = new Date().getMonth();

  monthDropdown.value = currentMonth;

});


      /* -------------------------------------------------------
       MOBILE SIDEBAR TOGGLE
    ------------------------------------------------------- */
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebarOverlay");
      const hamburger = document.getElementById("hamburger");

      function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("open");
      }

      function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("open");
      }

      hamburger.addEventListener("click", openSidebar);
      overlay.addEventListener("click", closeSidebar);

      /* Close sidebar on nav link click (mobile UX) */
      sidebar.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", closeSidebar);
      });