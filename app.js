const STORAGE_KEY = "truth-or-dare-18-players";

const state = {
  playerCount: 2,
  players: [],
  currentPlayerIndex: 0,
  turn: 1,
  truthStreak: 0,
  truthDeck: [],
  dareDeck: [],
};

const screens = {
  age: document.querySelector("#ageScreen"),
  setup: document.querySelector("#setupScreen"),
  game: document.querySelector("#gameScreen"),
};

const elements = {
  confirmAgeButton: document.querySelector("#confirmAgeButton"),
  resetButton: document.querySelector("#resetButton"),
  countButtons: [...document.querySelectorAll(".count-button")],
  playersForm: document.querySelector("#playersForm"),
  playersList: document.querySelector("#playersList"),
  editPlayersButton: document.querySelector("#editPlayersButton"),
  turnNumber: document.querySelector("#turnNumber"),
  currentAvatar: document.querySelector("#currentAvatar"),
  currentPlayerName: document.querySelector("#currentPlayerName"),
  choicePanel: document.querySelector("#choicePanel"),
  choiceHint: document.querySelector("#choiceHint"),
  truthButton: document.querySelector("#truthButton"),
  dareButton: document.querySelector("#dareButton"),
  taskPanel: document.querySelector("#taskPanel"),
  taskType: document.querySelector("#taskType"),
  taskText: document.querySelector("#taskText"),
  doneButton: document.querySelector("#doneButton"),
  truthDots: [...document.querySelectorAll("#truthDots i")],
};

const truthQuestions = buildTruthQuestions();
const dareTasks = buildDareTasks();

if (window.vkBridge) {
  window.vkBridge.send("VKWebAppInit").catch(() => {});
}

elements.confirmAgeButton.addEventListener("click", () => {
  const savedPlayers = loadPlayers();

  if (savedPlayers.length >= 2) {
    state.players = savedPlayers;
    state.playerCount = savedPlayers.length;
    startGame();
    return;
  }

  showScreen("setup");
  renderPlayersForm();
});

elements.resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state.playerCount = 2;
  state.players = [];
  updateCountButtons();
  renderPlayersForm();
});

elements.countButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.playerCount = Number(button.dataset.count);
    updateCountButtons();
    renderPlayersForm();
  });
});

elements.playersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const names = [...elements.playersForm.querySelectorAll("input")]
    .map((input, index) => input.value.trim() || `Игрок ${index + 1}`)
    .slice(0, state.playerCount);

  state.players = names.map((name) => ({
    name,
    initials: getInitials(name),
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.players));
  startGame();
});

elements.editPlayersButton.addEventListener("click", () => {
  state.playerCount = Math.min(Math.max(state.players.length || 2, 2), 4);
  updateCountButtons();
  renderPlayersForm();
  showScreen("setup");
});

elements.truthButton.addEventListener("click", () => selectTask("truth"));
elements.dareButton.addEventListener("click", () => selectTask("dare"));
elements.doneButton.addEventListener("click", nextTurn);

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[screenName].classList.add("is-active");
}

function renderPlayersForm() {
  const existing = state.players.length
    ? state.players.map((player) => player.name)
    : Array.from({ length: state.playerCount }, (_, index) => `Игрок ${index + 1}`);

  elements.playersList.innerHTML = "";

  for (let index = 0; index < state.playerCount; index += 1) {
    const name = existing[index] || `Игрок ${index + 1}`;
    const row = document.createElement("label");
    row.className = "player-row";
    row.innerHTML = `
      <span class="avatar">${getInitials(name)}</span>
      <input
        type="text"
        maxlength="18"
        name="player-${index}"
        value="${escapeHtml(name)}"
        aria-label="Имя игрока ${index + 1}"
      />
    `;

    const input = row.querySelector("input");
    const avatar = row.querySelector(".avatar");
    input.addEventListener("input", () => {
      avatar.textContent = getInitials(input.value || `Игрок ${index + 1}`);
    });

    elements.playersList.append(row);
  }
}

function updateCountButtons() {
  elements.countButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.count) === state.playerCount);
  });
}

function startGame() {
  state.currentPlayerIndex = 0;
  state.turn = 1;
  state.truthStreak = 0;
  state.truthDeck = shuffle([...truthQuestions]);
  state.dareDeck = shuffle([...dareTasks]);
  showScreen("game");
  renderTurn();
}

function renderTurn() {
  const player = state.players[state.currentPlayerIndex];
  elements.turnNumber.textContent = state.turn;
  elements.currentAvatar.textContent = player.initials;
  elements.currentPlayerName.textContent = player.name;
  elements.choicePanel.classList.remove("is-hidden");
  elements.taskPanel.classList.add("is-hidden");

  const truthLocked = state.truthStreak >= 2;
  elements.truthButton.disabled = truthLocked;
  elements.choiceHint.textContent = truthLocked
    ? "Две правды подряд уже были. Сейчас только действие."
    : "Выбери: правда или действие.";

  elements.truthDots.forEach((dot, index) => {
    dot.classList.toggle("is-hot", index < state.truthStreak);
  });
}

function selectTask(type) {
  const isTruth = type === "truth";
  const deck = isTruth ? state.truthDeck : state.dareDeck;
  const fallback = isTruth ? truthQuestions : dareTasks;

  if (deck.length === 0) {
    deck.push(...shuffle([...fallback]));
  }

  const text = deck.pop();
  state.truthStreak = isTruth ? state.truthStreak + 1 : 0;
  elements.taskType.textContent = isTruth ? "Правда" : "Действие";
  elements.taskText.textContent = text;
  elements.choicePanel.classList.add("is-hidden");
  elements.taskPanel.classList.remove("is-hidden");
  elements.truthDots.forEach((dot, index) => {
    dot.classList.toggle("is-hot", index < state.truthStreak);
  });
}

function nextTurn() {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.turn += 1;
  renderTurn();
}

function loadPlayers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed
          .slice(0, 4)
          .filter((player) => player && typeof player.name === "string")
          .map((player) => ({
            name: player.name,
            initials: getInitials(player.name),
          }))
      : [];
  } catch {
    return [];
  }
}

function getInitials(name) {
  const clean = String(name).trim();
  if (!clean) {
    return "?";
  }

  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function buildTruthQuestions() {
  const templates = [
    "Что в теме «{topic}» заводит тебя сильнее всего, если рядом только взрослые и всё по согласию?",
    "Какой самый смелый фантазийный сценарий про «{topic}» ты мог бы признать вслух?",
    "Когда разговор заходит про «{topic}», что ты обычно скрываешь за улыбкой?",
    "Какой комплимент на тему «{topic}» попал бы тебе прямо в слабое место?",
    "Что в «{topic}» кажется тебе запретным, но всё равно притягательным?",
    "Какой твой личный красный флаг в «{topic}», даже если атмосфера очень горячая?",
    "Что ты хотел бы попробовать в формате «{topic}», но только с ясным согласием?",
    "Какая деталь в «{topic}» мгновенно включает твоё внимание?",
    "Что в «{topic}» для тебя важнее: контроль, доверие или неожиданность?",
    "Какой момент, связанный с «{topic}», ты бы не стал рассказывать на первом свидании?",
    "Что в «{topic}» кажется тебе более интимным, чем поцелуй?",
    "Какой намёк на «{topic}» ты считаешь самым опасно обаятельным?",
    "С кем из игроков ты бы безопаснее всего обсудил «{topic}» и почему?",
    "Что в «{topic}» тебя смущает, но не отталкивает?",
    "Какой вопрос о «{topic}» ты боялся бы услышать именно сейчас?",
    "Что в «{topic}» звучит как игра, но быстро становится очень личным?",
    "Какая твоя граница в «{topic}» должна быть озвучена заранее?",
    "Что в «{topic}» ты считаешь переоценённым, а что недооценённым?",
    "Какой опыт про «{topic}» ты бы хотел стереть или повторить?",
    "Какая правда про «{topic}» сделала бы этот круг намного горячее?",
  ];

  const topics = [
    "первое свидание с откровенным финалом",
    "поцелуи в темноте",
    "флирт голосом и шёпотом",
    "ревность, которая только разогревает",
    "тайный краш в компании",
    "ролевой образ без пошлости",
    "ночные сообщения с двойным смыслом",
    "танец слишком близко",
    "прикосновения, от которых сбивается мысль",
    "комплименты телу без грубости",
    "инициатива в моменте",
    "запретный флирт, где нельзя переходить границы",
    "романтика на расстоянии",
    "самое смелое желание",
    "взгляд, который обещает больше слов",
  ];

  return combineToPool(templates, topics);
}

function buildDareTasks() {
  const templates = [
    "Скажи игроку {target} комплимент в стиле «{theme}», чтобы это звучало смело, но уважительно.",
    "Посмотри на игрока {target} 10 секунд так, будто между вами есть секрет про «{theme}».",
    "Произнеси фразу «я умею быть опасно нежным» голосом, подходящим для темы «{theme}».",
    "Покажи без прикосновений, как выглядит флирт на тему «{theme}».",
    "Выбери игрока {target} и задай ему один взрослый, но деликатный вопрос про «{theme}».",
    "Сделай мини-трейлер на 15 секунд к воображаемой сцене «{theme}».",
    "Скажи игроку {target}, какая его черта могла бы вписаться в сценарий «{theme}».",
    "Изобрази взгляд, которым начинается история «{theme}».",
    "Придумай безопасное стоп-слово для темы «{theme}» и объясни, почему выбрал его.",
    "Шёпотом произнеси нейтральную фразу так, чтобы она звучала как намёк на «{theme}».",
    "Сыграй 10 секунд уверенного человека, который первым предлагает «{theme}».",
    "Покажи жестом, где заканчивается флирт и начинается уважение к границам в «{theme}».",
    "Составь короткое сообщение на тему «{theme}», которое можно отправить только взрослому человеку.",
    "Выбери игрока {target} и скажи, какой аромат, цвет или музыка подошли бы к «{theme}».",
    "Сделай медленный поворот или позу для постера фильма «{theme}».",
    "Придумай название коктейля для настроения «{theme}» и произнеси его как тост.",
    "Покажи мимикой три стадии флирта: интерес, смущение, уверенность в теме «{theme}».",
    "Расскажи за 20 секунд историю, где «{theme}» остаётся только интригующим намёком.",
    "Сделай игроку {target} вежливое приглашение на воображаемое свидание в стиле «{theme}».",
    "Объяви правило взрослой вечеринки для темы «{theme}», которое сделает всем комфортно.",
  ];

  const themes = [
    "неоновый бар после полуночи",
    "поцелуй, который почти случился",
    "танец на расстоянии одного шага",
    "секретное сообщение ночью",
    "дерзкий комплимент без грубости",
    "свидание с запретной атмосферой",
    "взгляд через комнату",
    "игра в незнакомцев",
    "медленный плейлист для двоих",
    "роль загадочного соблазнителя",
    "флирт, где важнее паузы",
    "романтическое напряжение в лифте",
    "обещание, сказанное шёпотом",
    "первый шаг без давления",
    "ночь, где все границы названы заранее",
  ];

  return combineToPool(templates, themes);
}

function combineToPool(templates, details) {
  const targets = ["слева", "справа", "напротив"];
  const pool = [];

  templates.forEach((template, templateIndex) => {
    details.forEach((detail, detailIndex) => {
      const target = targets[(templateIndex + detailIndex) % targets.length];
      pool.push(
        template
          .replaceAll("{topic}", detail)
          .replaceAll("{theme}", detail)
          .replaceAll("{target}", target)
      );
    });
  });

  return pool;
}
