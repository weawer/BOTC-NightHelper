function StepRoleAssignment({ wizard, setup }) {
  const { setWizardStep, stepReady } = wizard;
  const { players, getAssignableOptions, setPlayerField } = setup;

  return (
    <section className="section card">
      <div className="row">
        <h2>Step 3 — Assign Roles to Players</h2>
      </div>

      <div className="player-list">
        {players.map((player) => {
          const assignableOptions = getAssignableOptions(
            player.id,
            player.character,
          );

          return (
            <article key={player.id} className="player-card">
              <div className="row tight">
                <span className="seat">Seat {player.id}</span>
                <span className={player.isAlive ? "alive" : "dead"}>
                  {player.isAlive ? "Alive" : "Dead"}
                </span>
              </div>

              <label>
                Name
                <input
                  className="text-input"
                  value={player.name}
                  onChange={(event) =>
                    setPlayerField(player.id, "name", event.target.value)
                  }
                />
              </label>

              <label>
                Character
                <select
                  className="text-input"
                  value={player.character}
                  onChange={(event) =>
                    setPlayerField(player.id, "character", event.target.value)
                  }
                >
                  <option value="">Unassigned</option>
                  {assignableOptions.map((character) => (
                    <option key={character} value={character}>
                      {character}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          );
        })}
      </div>

      <div className="row">
        <button type="button" className="btn" onClick={() => setWizardStep(2)}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => setWizardStep(4)}
          disabled={!stepReady[3]}
        >
          Continue to Night
        </button>
      </div>
    </section>
  );
}

export default StepRoleAssignment;
