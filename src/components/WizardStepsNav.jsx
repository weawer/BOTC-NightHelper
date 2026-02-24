function WizardStepsNav({ wizard }) {
  const { wizardStep, setWizardStep, stepReady, skipAssignments } = wizard;

  return (
    <section className="section card">
      <div className="wizard-row">
        <button
          type="button"
          className={`wizard-step ${wizardStep === 1 ? "is-current" : ""}`}
          onClick={() => setWizardStep(1)}
        >
          1. Script
        </button>
        <button
          type="button"
          className={`wizard-step ${wizardStep === 2 ? "is-current" : ""}`}
          onClick={() => setWizardStep(2)}
          disabled={!stepReady[1]}
        >
          2. Select Characters
        </button>
        <button
          type="button"
          className={`wizard-step ${wizardStep === 3 ? "is-current" : ""}`}
          onClick={() => setWizardStep(skipAssignments ? 4 : 3)}
          disabled={skipAssignments || !stepReady[1] || !stepReady[2]}
        >
          3. Assign Roles
        </button>
        <button
          type="button"
          className={`wizard-step ${wizardStep === 4 ? "is-current" : ""}`}
          onClick={() => setWizardStep(4)}
          disabled={
            !stepReady[1] ||
            !stepReady[2] ||
            (!skipAssignments && !stepReady[3])
          }
        >
          4. Start Night
        </button>
      </div>
    </section>
  );
}

export default WizardStepsNav;
