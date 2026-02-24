import StepCharacterSelection from "./components/StepCharacterSelection";
import StepNightFlow from "./components/StepNightFlow";
import StepRoleAssignment from "./components/StepRoleAssignment";
import StepScriptSetup from "./components/StepScriptSetup";
import WizardStepsNav from "./components/WizardStepsNav";
import useNightHelperState from "./hooks/useNightHelperState";

function App() {
  const { wizard, setup, nightFlow } = useNightHelperState();

  return (
    <main className="app-shell">
      <header className="section card">
        <div className="row tight">
          <div>
            <h1>Blood on the Clocktower — Night Helper Wizard</h1>
            <p className="muted">
              Step 1: Script • Step 2: Select Characters • Step 3: Assign Roles
              • Step 4: Night
            </p>
          </div>
          <button
            type="button"
            className="btn danger-toggle"
            onClick={wizard.resetGame}
          >
            Reset Game
          </button>
        </div>
      </header>

      <WizardStepsNav wizard={wizard} />

      {wizard.wizardStep === 1 && (
        <StepScriptSetup wizard={wizard} setup={setup} />
      )}

      {wizard.wizardStep === 2 && setup.selectedScript && (
        <StepCharacterSelection wizard={wizard} setup={setup} />
      )}

      {wizard.wizardStep === 3 && (
        <StepRoleAssignment wizard={wizard} setup={setup} />
      )}

      {wizard.wizardStep === 4 && <StepNightFlow nightFlow={nightFlow} />}
    </main>
  );
}

export default App;
