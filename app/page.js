import Script from "next/script";
import VkBridgeInit from "./VkBridgeInit";

export default function Page() {
  return (
    <>
      <VkBridgeInit />
      <main className="app-shell">
        <section className="screen age-screen is-active" id="ageScreen">
          <div className="brand-mark">18+</div>
          <p className="eyebrow">VK Mini App party game</p>
          <h1>Правда или действие</h1>
          <p className="lead">
            Провокационная игра для взрослых компаний. Все задания рассчитаны только на
            совершеннолетних участников и выполняются по взаимному согласию.
          </p>
          <button className="primary-button" id="confirmAgeButton">Мне есть 18, начать</button>
        </section>

        <section className="screen setup-screen" id="setupScreen">
          <div className="topline">
            <span className="pill">2-4 игрока</span>
            <button className="ghost-button" id="resetButton" type="button">Сброс</button>
          </div>
          <h2>Кто сегодня играет?</h2>
          <p className="hint">Выберите количество игроков и впишите имена в карточки.</p>

          <div className="player-count" aria-label="Количество игроков">
            <button className="count-button is-active" type="button" data-count="2">2</button>
            <button className="count-button" type="button" data-count="3">3</button>
            <button className="count-button" type="button" data-count="4">4</button>
          </div>

          <form className="players-form" id="playersForm">
            <div className="players-list" id="playersList"></div>
            <button className="primary-button" type="submit">Сохранить игроков</button>
          </form>
        </section>

        <section className="screen game-screen" id="gameScreen">
          <div className="game-top">
            <button className="ghost-button" id="editPlayersButton" type="button">Игроки</button>
            <div className="round-info">
              <span>Ход</span>
              <strong id="turnNumber">1</strong>
            </div>
          </div>

          <article className="turn-card">
            <div className="current-player">
              <div className="avatar" id="currentAvatar">А</div>
              <div>
                <p className="label">Сейчас выбирает</p>
                <h2 id="currentPlayerName">Игрок</h2>
              </div>
            </div>

            <div className="choice-panel" id="choicePanel">
              <p className="hint" id="choiceHint">Выбери: правда или действие.</p>
              <div className="choice-grid">
                <button className="choice-button truth" id="truthButton" type="button">
                  <span>Правда</span>
                  <small>личный вопрос</small>
                </button>
                <button className="choice-button dare" id="dareButton" type="button">
                  <span>Действие</span>
                  <small>смелый вызов</small>
                </button>
              </div>
            </div>

            <div className="task-panel is-hidden" id="taskPanel">
              <p className="task-type" id="taskType">Правда</p>
              <h3 id="taskText">Вопрос появится здесь</h3>
              <button className="primary-button" id="doneButton" type="button">Выполнено</button>
            </div>
          </article>

          <div className="streak-bar" aria-live="polite">
            <span>Правд подряд:</span>
            <div className="dots" id="truthDots">
              <i></i>
              <i></i>
            </div>
          </div>
        </section>
      </main>
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
