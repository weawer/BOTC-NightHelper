function StepNightFlow({ nightFlow }) {
  const {
    currentNightType,
    phase,
    startNight,
    nightsCompleted,
    currentRole,
    selectedScript,
    currentRoleDroisoned,
    advanceNightRole,
    endNight,
    dawnSummary,
    reminders,
    setReminders,
    players,
    drunkExtraTownsfolk,
    togglePlayerFlag,
  } = nightFlow;

  const formatPlayerRoleLabel = (player) => {
    const roleLabel = player.character || "Unassigned";

    if (player.character === "Drunk" && drunkExtraTownsfolk) {
      return `${roleLabel} (extra: ${drunkExtraTownsfolk}, poisoned)`;
    }

    return roleLabel;
  };

  const formatPlayerDisplayLabel = (player, includeLifeState = false) => {
    const playerName =
      typeof player.name === "string" ? player.name.trim() : "";
    const roleLabel = formatPlayerRoleLabel(player);
    const baseLabel =
      playerName && playerName !== roleLabel
        ? `${playerName} — ${roleLabel}`
        : roleLabel;

    if (!includeLifeState) {
      return baseLabel;
    }

    return `${baseLabel} (${player.isAlive ? "Alive" : "Dead"})`;
  };

  return (
    <>
      <section className="section card">
        <h2>Step 4 — Night Flow</h2>
        <p className="muted">
          Next night type:{" "}
          {currentNightType === "first" ? "First Night" : "Other Night"}
        </p>

        {phase !== "running" && (
          <button type="button" className="btn primary" onClick={startNight}>
            {nightsCompleted === 0 ? "Start First Night" : "Start Next Night"}
          </button>
        )}

        {phase === "running" && currentRole && (
          <div className="night-step">
            <p className="role-pill">Current Role: {currentRole}</p>
            <p>
              {selectedScript?.rolePrompts[currentRole] ||
                `${currentRole}: Resolve this role now.`}
            </p>
            {currentRoleDroisoned && (
              <p className="warning">
                REMINDER: This player is Droisoned. You may give them FALSE
                information.
              </p>
            )}
            <div className="row">
              <button type="button" className="btn" onClick={advanceNightRole}>
                Next Role
              </button>
              <button type="button" className="btn primary" onClick={endNight}>
                End Night
              </button>
            </div>
          </div>
        )}

        {phase !== "running" && dawnSummary && (
          <p className="dawn-summary">{dawnSummary}</p>
        )}
      </section>

      <section className="section card">
        <h2>Night Reminders</h2>
        <div className="reminder-grid">
          <label>
            Demon killed
            <select
              className="text-input"
              value={reminders.demonKilledId}
              onChange={(event) =>
                setReminders((current) => ({
                  ...current,
                  demonKilledId: event.target.value,
                }))
              }
              disabled={phase !== "running"}
            >
              <option value="">No kill recorded</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {formatPlayerDisplayLabel(player, true)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Monk protected
            <select
              className="text-input"
              value={reminders.monkProtectedId}
              onChange={(event) =>
                setReminders((current) => ({
                  ...current,
                  monkProtectedId: event.target.value,
                }))
              }
              disabled={phase !== "running"}
            >
              <option value="">No protection recorded</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {formatPlayerDisplayLabel(player)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Notes
            <textarea
              className="text-input"
              rows="3"
              value={reminders.notes}
              placeholder="Optional storyteller notes"
              onChange={(event) =>
                setReminders((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              disabled={phase !== "running"}
            />
          </label>
        </div>
      </section>

      <section className="section card">
        <h2>Between Nights: Kill / Revive Players</h2>
        <p className="muted">
          Use this after dawn and before the next Start Night.
        </p>
        <div className="player-list">
          {players.map((player) => (
            <article key={player.id} className="player-card compact">
              <div className="row tight">
                <strong>{formatPlayerDisplayLabel(player)}</strong>
                <span className={player.isAlive ? "alive" : "dead"}>
                  {player.isAlive ? "Alive" : "Dead"}
                </span>
              </div>
              <div className="status-grid">
                <button
                  type="button"
                  className={`btn ${player.isDrunk ? "active-toggle" : ""}`}
                  onClick={() => togglePlayerFlag(player.id, "isDrunk")}
                >
                  {player.isDrunk ? "Drunk ON" : "Drunk"}
                </button>
                <button
                  type="button"
                  className={`btn ${player.isPoisoned ? "active-toggle" : ""}`}
                  onClick={() => togglePlayerFlag(player.id, "isPoisoned")}
                >
                  {player.isPoisoned ? "Poisoned ON" : "Poisoned"}
                </button>
                <button
                  type="button"
                  className={`btn ${player.isAlive ? "danger-toggle" : "primary"}`}
                  onClick={() => togglePlayerFlag(player.id, "isAlive")}
                >
                  {player.isAlive ? "Kill" : "Revive"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default StepNightFlow;
