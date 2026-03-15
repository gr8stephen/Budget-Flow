
    /* 
       STATE
    */
    const state = {
      budget: { month: '', total: 0, savedFromBudget: 0 },
      categories: [],
      goals: [],
      totalSavings: 0,
      nextCatId: 1,
      nextGoalId: 1,
    };

    let editingCatId = null, deletingCatId = null, logSpendCatId = null;
    let correctSpendCatId = null, deletingGoalId = null, fundGoalId = null;
    let selectedEmoji = '🍔';
    let moneySource = 'outside'; // 'outside' | 'budget'


    // SCREEN SWITCHER
    let currentScreen = 'budget';
    let previousScreen = null;

    function showScreen(name) {
        previousScreen = currentScreen;
        currentScreen = name;
      //hide all screens
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
      //show requested screen
      document.getElementById('screen-' + name).classList.add('visible');
      

      //highlight the right sidebar nav item
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById(name === 'budget' ? 'nav-budget' : 'nav-savings').classList.add('active');
    }

    function goBack(){
        if (previousScreen){
            //if theres a previous screen within this page go there
            showScreen(previousScreen)
        }
            else{
            history.back(); //otherwise go back in history (to previous page)
        }
    }



    //MODAL HELPERS
    function openModal(id) {
      if (id === 'add-money') { populateGoalSelect(); resetSourceToggle(); }
      document.getElementById('modal-' + id).classList.add('open');
    }

    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
      document.querySelectorAll('.modal-error').forEach(el => el.textContent = '');
    }

    function overlayClose(event, id) {
      if (event.target === document.getElementById(id)) closeModal(id);
    }


    //TOAST 
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }


    //EMOJI PICKER — runs once on page load

    (function buildEmojiPicker() {
      const emojis = ['🍔','🚗','💊','📄','🎮','📚','🚀','🛒','✈️','🏠','👗','💡','🎵','🐾','💪'];
      const row = document.getElementById('emoji-row');
      selectedEmoji = emojis[0];
      emojis.forEach((emoji, index) => {
        const tile = document.createElement('div');
        tile.className   = 'emoji-opt' + (index === 0 ? ' selected' : '');
        tile.textContent = emoji;
        tile.onclick = () => {
          row.querySelectorAll('.emoji-opt').forEach(t => t.classList.remove('selected'));
          tile.classList.add('selected');
          selectedEmoji = emoji;
        };
        row.appendChild(tile);
      });
    })();


    //SOURCE TOGGLE   
    function selectSource(source) {
      moneySource = source;
      document.getElementById('src-outside').classList.toggle('selected', source === 'outside');
      document.getElementById('src-budget').classList.toggle('selected',  source === 'budget');
    }

    function resetSourceToggle() { moneySource = 'outside'; selectSource('outside'); }


    //BUDGET — Set & Render
    function setBudget() {
      const month  = document.getElementById('sb-month').value;
      const amount = parseFloat(document.getElementById('sb-amount').value);
      const err    = document.getElementById('sb-error');
      if (!month)                { err.textContent = 'Please select a month.';        return; }
      if (!amount || amount <= 0){ err.textContent = 'Please enter a valid amount.';  return; }
      state.budget.month = month;
      state.budget.total = amount;
      renderBudgetSummary();
      closeModal('modal-set-budget');
      document.getElementById('sb-month').value  = '';
      document.getElementById('sb-amount').value = '';
      showToast('✅ Budget set successfully!');
    }

    function getBudgetSpent() {
      return state.categories.reduce((sum, cat) => sum + cat.spent, 0)
           + state.budget.savedFromBudget;
    }

    function renderBudgetSummary() {
      const { month, total } = state.budget;
      const spent  = getBudgetSpent();
      const label  = month
        ? new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) + ' Budget'
        : 'No Budget Set';
      const isOver = total > 0 && spent > total;
      const pct    = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
      const sub    = total > 0
        ? (isOver ? '⚠️ Over budget!' : `${state.categories.length} categories — ₵${fmt(total - spent)} left`)
        : 'Set a budget to get started';

      document.getElementById('budget-month-label').textContent = label;
      document.getElementById('budget-display').textContent     = total > 0 ? `₵${fmt(spent)} / ₵${fmt(total)}` : '₵0 / ₵0';
      const subEl = document.getElementById('budget-cats-label');
      subEl.textContent = sub;
      subEl.className   = 's-sub' + (isOver ? ' over' : '');

      const bar = document.getElementById('overall-bar');
      bar.style.width = pct + '%';
      bar.className   = 'overall-bar-fill ' + barColor(pct);
      document.getElementById('overall-spent-label').textContent = `₵${fmt(spent)} spent`;
      document.getElementById('overall-left-label').textContent  = total > 0
        ? (isOver ? `₵${fmt(spent - total)} over` : `₵${fmt(total - spent)} remaining`) : '';

      document.getElementById('sav-budget-month').textContent   = label;
      document.getElementById('sav-budget-display').textContent = total > 0 ? `₵${fmt(spent)} / ₵${fmt(total)}` : '₵0 / ₵0';
      document.getElementById('sav-budget-cats').textContent    = sub;
    }


    // CATEGORIES — Add
    function addCategory() {
      const name  = document.getElementById('ac-name').value.trim();
      const limit = parseFloat(document.getElementById('ac-limit').value);
      const err   = document.getElementById('ac-error');
      if (!name)                { err.textContent = 'Please enter a name.';        return; }
      if (!limit || limit <= 0) { err.textContent = 'Please enter a valid limit.'; return; }
      state.categories.push({ id: state.nextCatId++, emoji: selectedEmoji, name, limit, spent: 0 });
      renderCategories(); renderBudgetSummary(); closeModal('modal-add-category');
      document.getElementById('ac-name').value  = '';
      document.getElementById('ac-limit').value = '';
      showToast('✅ Category added!');
    }


    // CATEGORIES — Edit 
    function openEditCategory(id) {
      const cat = state.categories.find(c => c.id === id); if (!cat) return;
      editingCatId = id;
      document.getElementById('ec-name').value  = cat.name;
      document.getElementById('ec-limit').value = cat.limit;
      openModal('edit-category');
    }

    function saveEditCategory() {
      const name  = document.getElementById('ec-name').value.trim();
      const limit = parseFloat(document.getElementById('ec-limit').value);
      const err   = document.getElementById('ec-error');
      if (!name)                { err.textContent = 'Please enter a name.';        return; }
      if (!limit || limit <= 0) { err.textContent = 'Please enter a valid limit.'; return; }
      const cat = state.categories.find(c => c.id === editingCatId);
      if (cat) { cat.name = name; cat.limit = limit; }
      renderCategories(); renderBudgetSummary(); closeModal('modal-edit-category');
      showToast('✏️ Category updated!');
    }


    //CATEGORIES — Delete
    function askDeleteCategory(id) {
      const cat = state.categories.find(c => c.id === id); if (!cat) return;
      deletingCatId = id;
      document.getElementById('confirm-cat-msg').innerHTML =
        `You're about to delete <strong>${cat.emoji} ${cat.name}</strong>.<br>
         You've tracked <strong>₵${fmt(cat.spent)}</strong> here. This can't be undone.`;
      openModal('confirm-cat');
    }

    function confirmDeleteCategory() {
      state.categories = state.categories.filter(c => c.id !== deletingCatId);
      renderCategories(); renderBudgetSummary(); closeModal('modal-confirm-cat');
      showToast('🗑️ Category deleted.');
      deletingCatId = null;
    }


    //CATEGORIES — Log Spend
    function openLogSpend(id) {
      const cat = state.categories.find(c => c.id === id); if (!cat) return;
      logSpendCatId = id;
      document.getElementById('ls-hint').textContent =
        `Logging spend for: ${cat.emoji} ${cat.name}  (₵${fmt(cat.spent)} / ₵${fmt(cat.limit)} used)`;
      document.getElementById('ls-amount').value = '';
      openModal('log-spend');
    }

    function logSpend() {
      const amount = parseFloat(document.getElementById('ls-amount').value);
      const err    = document.getElementById('ls-error');
      if (!amount || amount <= 0) { err.textContent = 'Enter a valid amount.'; return; }
      const cat = state.categories.find(c => c.id === logSpendCatId);
      if (cat) cat.spent += amount;
      renderCategories(); renderBudgetSummary(); closeModal('modal-log-spend');
      showToast(`💸 ₵${fmt(amount)} logged to ${cat.emoji} ${cat.name}`);
    }


    // CATEGORIES — Fix / Correct Spend
    function openCorrectSpend(id) {
      const cat = state.categories.find(c => c.id === id); if (!cat) return;
      correctSpendCatId = id;
      document.getElementById('cs-hint').innerHTML =
        `Correcting spend for <strong>${cat.emoji} ${cat.name}</strong>.<br>
         Currently recorded: <strong style="color:#fff">₵${fmt(cat.spent)}</strong> — enter the correct total below.`;
      document.getElementById('cs-amount').value      = cat.spent;
      document.getElementById('cs-error').textContent = '';
      openModal('correct-spend');
    }

    function saveCorrectSpend() {
      const newSpent = parseFloat(document.getElementById('cs-amount').value);
      const err      = document.getElementById('cs-error');
      if (isNaN(newSpent) || newSpent < 0) { err.textContent = 'Enter a valid amount (0 or more).'; return; }
      const cat = state.categories.find(c => c.id === correctSpendCatId);
      if (cat) {
        const oldSpent = cat.spent;
        cat.spent = newSpent;
        renderCategories(); renderBudgetSummary(); closeModal('modal-correct-spend');
        const diff = newSpent - oldSpent;
        showToast(diff === 0 ? '✅ No change made.'
          : diff > 0 ? `⬆️ Corrected up by ₵${fmt(diff)}`
          : `⬇️ Corrected down by ₵${fmt(Math.abs(diff))} — budget recovered!`);
      }
    }


    //CATEGORIES — Render
    function renderCategories() {
      const list = document.getElementById('category-list');
      if (state.categories.length === 0) {
        list.innerHTML = `<div class="empty-state">No categories yet — click <strong>+ Add Category</strong> to get started.</div>`;
        return;
      }
      list.innerHTML = '';
      state.categories.forEach(cat => {
        const pct    = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
        const isOver = cat.spent > cat.limit;
        const isWarn = pct >= 80 && !isOver;
        const color  = isOver ? 'fill-red' : isWarn ? 'fill-warn' : pct >= 50 ? 'fill-orange' : 'fill-green';
        const warnMsg = isOver
          ? `⚠️ Over limit by ₵${fmt(cat.spent - cat.limit)}`
          : isWarn ? `⚡ ${Math.round(pct)}% used — approaching limit` : '';
        const row = document.createElement('div');
        row.className = 'category-row';
        row.innerHTML = `
          <div class="category-top">
            <div class="cat-left">
              <span style="font-size:15px">${cat.emoji}</span>
              <span class="cat-name">${cat.name}</span>
            </div>
            <div class="cat-right">
              <span class="cat-amounts">₵${fmt(cat.spent)} / ₵${fmt(cat.limit)}</span>
              <div class="cat-actions">
                <button class="cat-btn cat-btn-spend"   onclick="openLogSpend(${cat.id})">＋ Spend</button>
                <button class="cat-btn cat-btn-correct" onclick="openCorrectSpend(${cat.id})">🔧 Fix</button>
                <button class="cat-btn cat-btn-edit"    onclick="openEditCategory(${cat.id})">✏️ Edit</button>
                <button class="cat-btn cat-btn-del"     onclick="askDeleteCategory(${cat.id})">🗑 Delete</button>
              </div>
            </div>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill ${color}" style="width:${pct}%"></div>
          </div>
          ${warnMsg ? `<div class="cat-warning">${warnMsg}</div>` : ''}
        `;
        list.appendChild(row);
      });
    }


    //GOALS — Add
    function addGoal() {
      const name   = document.getElementById('ag-name').value.trim();
      const target = parseFloat(document.getElementById('ag-amount').value);
      const date   = document.getElementById('ag-date').value;
      const err    = document.getElementById('ag-error');
      if (!name)                 { err.textContent = 'Please enter a name.';         return; }
      if (!target || target <= 0){ err.textContent = 'Please enter a valid amount.'; return; }
      if (!date)                 { err.textContent = 'Please select a due date.';    return; }
      state.goals.push({ id: state.nextGoalId++, name, target, saved: 0, due: date });
      renderGoals(); closeModal('modal-add-goal');
      ['ag-name','ag-amount','ag-date'].forEach(id => document.getElementById(id).value = '');
      showToast('🎯 Goal added! Start saving!');
    }


    // GOALS — Delete (emotion-aware)
    function askDeleteGoal(id) {
      const goal = state.goals.find(g => g.id === id); if (!goal) return;
      deletingGoalId = id;
      const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
      let emoji, title, message;
      if      (pct === 0) { emoji='🗑️'; title='Delete this goal?';          message=`You haven't saved anything toward <strong>${goal.name}</strong> yet. Are you sure?`; }
      else if (pct < 25)  { emoji='😕'; title='Already making progress...'; message=`You've saved <strong>₵${fmt(goal.saved)}</strong> (${pct}%) toward <strong>${goal.name}</strong>. It'll be gone if you delete this.`; }
      else if (pct < 60)  { emoji='😢'; title='We were getting there...';   message=`You're ${pct}% of the way to <strong>${goal.name}</strong>! That's <strong>₵${fmt(goal.saved)}</strong> saved. Sure you want to give up?`; }
      else if (pct < 90)  { emoji='😭'; title="So close... don't do this!"; message=`You've saved <strong>₵${fmt(goal.saved)}</strong> — ${pct}% toward <strong>${goal.name}</strong>! You're so close. 💔`; }
      else                { emoji='💔'; title='Almost there — really?!';    message=`You're at ${pct}%! Just <strong>₵${fmt(goal.target-goal.saved)}</strong> away from <strong>${goal.name}</strong>. Please don't give up! 😭`; }
      document.getElementById('confirm-goal-emoji').textContent = emoji;
      document.getElementById('confirm-goal-title').textContent = title;
      document.getElementById('confirm-goal-msg').innerHTML     = message;
      openModal('confirm-goal');
    }

    function confirmDeleteGoal() {
      const goal = state.goals.find(g => g.id === deletingGoalId);
      if (goal) state.totalSavings += goal.saved; // return saved money to balance
      state.goals = state.goals.filter(g => g.id !== deletingGoalId);
      renderGoals(); renderSavingsBalance(); closeModal('modal-confirm-goal');
      showToast('🗑️ Goal deleted. Savings returned to your balance.');
      deletingGoalId = null;
    }


    // GOALS — Fund
    function openFundGoal(id) {
      const goal = state.goals.find(g => g.id === id); if (!goal) return;
      fundGoalId = id;
      document.getElementById('fg-hint').textContent =
        `"${goal.name}" — ₵${fmt(goal.saved)} saved of ₵${fmt(goal.target)} target `
        + `(₵${fmt(goal.target - goal.saved)} to go). Available: ₵${fmt(state.totalSavings)}`;
      document.getElementById('fg-amount').value = '';
      openModal('fund-goal');
    }

    function fundGoal() {
      const amount = parseFloat(document.getElementById('fg-amount').value);
      const err    = document.getElementById('fg-error');
      if (!amount || amount <= 0)      { err.textContent = 'Enter a valid amount.';                                          return; }
      if (amount > state.totalSavings) { err.textContent = `Not enough savings (₵${fmt(state.totalSavings)} available).`;  return; }
      const goal = state.goals.find(g => g.id === fundGoalId);
      if (goal) {
        const allocate      = Math.min(amount, goal.target - goal.saved);
        goal.saved         += allocate;
        state.totalSavings -= allocate;
      }
      renderGoals(); renderSavingsBalance(); closeModal('modal-fund-goal');
      showToast(`💚 ₵${fmt(amount)} allocated to "${goal.name}"`);
    }


    //GOALS — Render
    function renderGoals() {
      const grid = document.getElementById('goals-grid');
      if (state.goals.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1" class="empty-state">No goals yet — add one to start saving!</div>`;
        return;
      }
      grid.innerHTML = '';
      const today = new Date();
      state.goals.forEach(goal => {
        const pct         = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
        const completed   = pct >= 100;
        const [yr, mo]    = goal.due.split('-');
        const dueDate     = new Date(yr, mo - 1);
        const monthsLeft  = (dueDate.getFullYear() - today.getFullYear()) * 12
                          + (dueDate.getMonth() - today.getMonth());
        const showDueWarn = !completed && monthsLeft <= 1 && pct < 80;
        const monthName   = dueDate.toLocaleString('default', { month: 'short' });
        const card = document.createElement('div');
        card.className = 'goal-card' + (completed ? ' completed' : '');
        card.innerHTML = `
          ${completed ? '<div class="goal-complete-badge">✅ Completed!</div>' : ''}
          <div class="goal-top-row">
            <div class="goal-name">${goal.name}</div>
            <div class="goal-target">₵${fmt(goal.target)}</div>
          </div>
          <div class="goal-due">Due ${monthName}, ${yr}</div>
          ${showDueWarn ? '<div class="goal-due-warning">⚠️ Due soon!</div>' : ''}
          <div class="goal-saved-row">
            <span>₵${fmt(goal.saved)} saved</span>
            <span class="goal-pct ${pct < 30 ? 'warn' : ''}">${Math.round(pct)}%</span>
          </div>
          <div class="goal-progress-track">
            <div class="goal-progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="goal-card-actions">
            ${!completed ? `<button class="goal-fund-btn" onclick="openFundGoal(${goal.id})">＋ Fund</button>` : ''}
            <button class="goal-del-btn" onclick="askDeleteGoal(${goal.id})">🗑 Delete</button>
          </div>
        `;
        grid.appendChild(card);
      });
    }


    //SAVINGS — Add Money
    function populateGoalSelect() {
      const select = document.getElementById('am-goal');
      select.innerHTML = '<option value="">— General Savings —</option>';
      state.goals.filter(g => g.saved < g.target).forEach(g => {
        const option       = document.createElement('option');
        option.value       = g.id;
        option.textContent = `${g.name}  (₵${fmt(g.target - g.saved)} remaining)`;
        select.appendChild(option);
      });
    }

    function addMoney() {
      const amount = parseFloat(document.getElementById('am-amount').value);
      const goalId = document.getElementById('am-goal').value;
      const err    = document.getElementById('am-error');
      if (!amount || amount <= 0) { err.textContent = 'Enter a valid amount.'; return; }
      if (moneySource === 'budget') {
        const remaining = state.budget.total - getBudgetSpent();
        if (state.budget.total === 0) { err.textContent = 'No budget set. Please set a budget first.'; return; }
        if (amount > remaining)       { err.textContent = `Only ₵${fmt(remaining)} remaining in your budget.`; return; }
        state.budget.savedFromBudget += amount;
      }
      state.totalSavings += amount;
      if (goalId) {
        const goal = state.goals.find(g => g.id == goalId);
        if (goal) goal.saved = Math.min(goal.saved + amount, goal.target);
        renderGoals();
      }
      renderSavingsBalance(); renderBudgetSummary(); closeModal('modal-add-money');
      document.getElementById('am-amount').value = '';
      showToast(`💰 ₵${fmt(amount)} added to savings (${moneySource === 'budget' ? 'from budget' : 'outside money'})`);
    }

    function renderSavingsBalance() {
      document.getElementById('total-savings-display').textContent =
        `₵${Number(state.totalSavings).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }


    //UTILITIES

    /** Format number with commas, max 2 decimal places */
    function fmt(n) { return Number(n).toLocaleString('en', { maximumFractionDigits: 2 }); }

    /** Return the right CSS bar-color class for a given spend % */
    function barColor(pct) {
      if (pct >= 100) return 'fill-red';
      if (pct >= 80)  return 'fill-warn';
      if (pct >= 50)  return 'fill-orange';
      return 'fill-green';
    }


    //INIT
    renderBudgetSummary();
    renderCategories();
    renderGoals();
    renderSavingsBalance();
