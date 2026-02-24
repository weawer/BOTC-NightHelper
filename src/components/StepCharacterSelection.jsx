function StepCharacterSelection({ wizard, setup }) {
  const { setWizardStep, stepReady } = wizard;
  const {
    categories,
    selectedCharacters,
    skipAssignments,
    applySkipAssignmentsFromSelectedCharacters,
    toggleCharacterInGame,
    quickFillRecommendedCharacters,
    drunkExtraTownsfolk,
    setDrunkExtraTownsfolk,
    selectedByCategory,
    expectedSetup,
    playerCount,
    roleCountLabel,
  } = setup;

  const renderCategoryPicker = (categoryKey, title) => {
    const categoryCharacters = categories[categoryKey] ?? [];

    return (
      <section className="category-card">
        <h3>{title}</h3>
        <div className="character-button-grid">
          {categoryCharacters.map((character) => {
            const isSelected = selectedCharacters.includes(character);

            return (
              <button
                key={character}
                type="button"
                className={`character-button ${isSelected ? "is-selected" : ""}`}
                onClick={() => toggleCharacterInGame(character)}
              >
                {character}
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  const drunkExtraTownsfolkOptions = (categories.townsfolk ?? []).filter(
    (character) =>
      !selectedCharacters.includes(character) || character === drunkExtraTownsfolk,
  );

  return (
    <section className="section card">
      <h2>Step 2 — Build the bag</h2>

      <div className="count-reminders">
        <p className="muted">
          Selected {selectedCharacters.length}/{playerCount} characters.
        </p>
        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={quickFillRecommendedCharacters}
            disabled={!expectedSetup}
          >
            Quick Fill Recommended
          </button>
        </div>
        {expectedSetup && (
          <div className="count-grid">
            <p>
              {roleCountLabel(
                "Townsfolk",
                selectedByCategory.townsfolk,
                expectedSetup.townsfolk,
              )}
            </p>
            <p>
              {roleCountLabel(
                "Outsider",
                selectedByCategory.outsider,
                expectedSetup.outsider,
              )}
            </p>
            <p>
              {roleCountLabel(
                "Minion",
                selectedByCategory.minion,
                expectedSetup.minion,
              )}
            </p>
            <p>
              {roleCountLabel("Imp", selectedByCategory.imp, expectedSetup.imp)}
            </p>
          </div>
        )}

        {selectedCharacters.includes("Drunk") && (
          <label>
            Drunk extra Townsfolk (always treated as poisoned)
            <select
              className="text-input"
              value={drunkExtraTownsfolk}
              onChange={(event) => setDrunkExtraTownsfolk(event.target.value)}
            >
              <option value="">Select Townsfolk</option>
              {drunkExtraTownsfolkOptions.map((character) => (
                <option key={character} value={character}>
                  {character}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="role-groups">
        {renderCategoryPicker("townsfolk", "Townsfolk")}
        {renderCategoryPicker("outsider", "Outsider")}
        {renderCategoryPicker("minion", "Minion")}
        {renderCategoryPicker("imp", "Imp")}
      </div>

      <div className="row">
        <button type="button" className="btn" onClick={() => setWizardStep(1)}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (skipAssignments) {
              applySkipAssignmentsFromSelectedCharacters();
              setWizardStep(4);
              return;
            }

            setWizardStep(3);
          }}
          disabled={!stepReady[2]}
        >
          {skipAssignments
            ? "Continue to Night"
            : "Continue to Role Assignment"}
        </button>
      </div>
    </section>
  );
}

export default StepCharacterSelection;
