import { useMemo, useState } from "react";
import { SCRIPT_OPTIONS } from "../gameScripts";

function StepScriptSetup({ wizard, setup }) {
  const [newSavedPlayerName, setNewSavedPlayerName] = useState("");

  const { setWizardStep, stepReady } = wizard;
  const {
    selectedScriptId,
    setSelectedScriptId,
    setSelectedCharacters,
    setPlayers,
    skipAssignments,
    setSkipAssignments,
    playerCount,
    applyPlayerCount,
    savedPlayerNames,
    addSavedPlayerName,
    removeSavedPlayerNames,
    addSavedPlayersToSession,
    fillWithDefaultPlayers,
    players,
  } = setup;

  const availableSavedNames = useMemo(
    () =>
      Array.from(
        new Set(
          (savedPlayerNames ?? [])
            .map((name) => (typeof name === "string" ? name.trim() : ""))
            .filter(Boolean),
        ),
      ),
    [savedPlayerNames],
  );

  const checkedSavedNames = useMemo(
    () =>
      Array.from(
        new Set(
          players
            .map((player) =>
              typeof player.name === "string" ? player.name.trim() : "",
            )
            .filter((name) => name && availableSavedNames.includes(name)),
        ),
      ),
    [players, availableSavedNames],
  );

  const onAddSavedPlayerName = () => {
    addSavedPlayerName(newSavedPlayerName);
    setNewSavedPlayerName("");
  };

  const toggleCheckedSavedName = (name) => {
    const nextChecked = checkedSavedNames.includes(name)
      ? checkedSavedNames.filter((item) => item !== name)
      : [...checkedSavedNames, name];

    addSavedPlayersToSession(nextChecked);
  };

  const onRemoveCheckedFromMemory = () => {
    removeSavedPlayerNames(checkedSavedNames);
  };

  return (
    <section className="section card">
      <h2>Step 1 — Choose Script</h2>
      <div className="setup-grid">
        <label>
          Script
          <select
            className="text-input"
            value={selectedScriptId}
            onChange={(event) => {
              setSelectedScriptId(event.target.value);
              setSelectedCharacters([]);
              setPlayers((currentPlayers) =>
                currentPlayers.map((player) => ({ ...player, character: "" })),
              );
            }}
          >
            <option value="">Select a script</option>
            {SCRIPT_OPTIONS.map((script) => (
              <option key={script.id} value={script.id}>
                {script.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Number of players
          <select
            className="text-input"
            value={playerCount}
            onChange={(event) =>
              applyPlayerCount(Number(event.target.value || 0))
            }
          >
            {Array.from({ length: 11 }, (_, index) => {
              const value = index + 5;
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </label>

        <label className="check-item">
          <input
            type="checkbox"
            checked={skipAssignments}
            onChange={(event) => setSkipAssignments(event.target.checked)}
          />
          <span>Skip names and role assignment (jump to night)</span>
        </label>
      </div>

      <section className="count-reminders" style={{ marginTop: "0.8rem" }}>
        <p className="muted">
          Add saved player names to memory for future games.
        </p>

        <div className="row">
          <label style={{ flex: 1, minWidth: "220px" }}>
            Saved player name
            <input
              type="text"
              className="text-input"
              value={newSavedPlayerName}
              onChange={(event) => setNewSavedPlayerName(event.target.value)}
              placeholder="Enter player name"
            />
          </label>

          <button
            type="button"
            className="btn"
            onClick={onAddSavedPlayerName}
            disabled={!newSavedPlayerName.trim()}
          >
            Add Saved Player
          </button>
        </div>

        {availableSavedNames.length > 0 && (
          <div className="checkbox-grid">
            {availableSavedNames.map((name) => (
              <label key={name} className="check-item">
                <input
                  type="checkbox"
                  checked={checkedSavedNames.includes(name)}
                  onChange={() => toggleCheckedSavedName(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        )}

        {availableSavedNames.length > 0 && (
          <div className="row" style={{ marginTop: "0.6rem" }}>
            <button
              type="button"
              className="btn"
              onClick={fillWithDefaultPlayers}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn danger-toggle"
              onClick={onRemoveCheckedFromMemory}
              disabled={checkedSavedNames.length === 0}
            >
              Remove Checked Names from Memory
            </button>
          </div>
        )}
      </section>

      {availableSavedNames.length === 0 && (
        <p className="muted" style={{ marginTop: "0.6rem" }}>
          No saved players yet.
        </p>
      )}

      <div className="row">
        <button
          type="button"
          className="btn primary"
          onClick={() => setWizardStep(2)}
          disabled={!stepReady[1]}
        >
          Continue to Character Selection
        </button>
      </div>
    </section>
  );
}

export default StepScriptSetup;
