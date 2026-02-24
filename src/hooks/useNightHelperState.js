import { useEffect, useMemo, useState } from "react";
import { SCRIPT_OPTIONS } from "../gameScripts";

const COOKIE_NAME = "botc-night-helper-state";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const PLAYER_NAMES_STORAGE_KEY = "botc-player-names";

const createPlayer = (id, name) => ({
  id,
  name: name || `Player ${id}`,
  character: "",
  isAlive: true,
  isDrunk: false,
  isPoisoned: false,
});

const createRoleNamedPlayer = (id, role) => ({
  id,
  name: role,
  character: role,
  isAlive: true,
  isDrunk: false,
  isPoisoned: false,
});

const createDefaultPlayers = (count = 8) =>
  Array.from({ length: count }, (_, index) => createPlayer(index + 1));

const defaultPlayerName = (index) => `Player ${index + 1}`;

const applyBaronAdjustment = (expectedSetup, selectedCharacters) => {
  if (!expectedSetup) {
    return null;
  }

  if (!selectedCharacters.includes("Baron")) {
    return expectedSetup;
  }

  return {
    ...expectedSetup,
    outsider: expectedSetup.outsider + 2,
    townsfolk: Math.max(0, expectedSetup.townsfolk - 2),
  };
};

const pickCharacters = (pool, count, preferred = []) => {
  const picked = [];

  for (const preferredCharacter of preferred) {
    if (
      picked.length < count &&
      pool.includes(preferredCharacter) &&
      !picked.includes(preferredCharacter)
    ) {
      picked.push(preferredCharacter);
    }
  }

  for (const character of pool) {
    if (picked.length >= count) {
      break;
    }

    if (!picked.includes(character)) {
      picked.push(character);
    }
  }

  return picked;
};

const writeCookie = (name, value, maxAgeSeconds) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
};

const readCookie = (name) => {
  const target = `${name}=`;
  const parts = document.cookie.split(";");

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }

  return "";
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const readSavedPlayerNames = () => {
  try {
    const raw = window.localStorage.getItem(PLAYER_NAMES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .slice(0, 15)
      .map((name) => (typeof name === "string" ? name : ""));
  } catch {
    return [];
  }
};

const writeSavedPlayerNames = (names) => {
  try {
    window.localStorage.setItem(
      PLAYER_NAMES_STORAGE_KEY,
      JSON.stringify(names),
    );
  } catch {
    // Ignore localStorage write issues.
  }
};

const loadPersistedState = () => {
  try {
    const raw = readCookie(COOKIE_NAME);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const buildInitialState = () => {
  const persisted = loadPersistedState();

  const playerCount = Number.isInteger(persisted?.playerCount)
    ? Math.max(5, Math.min(15, persisted.playerCount))
    : 8;

  const players =
    Array.isArray(persisted?.players) && persisted.players.length > 0
      ? persisted.players.slice(0, 15).map((player, index) => ({
          id: index + 1,
          name:
            typeof player?.name === "string"
              ? player.name
              : `Player ${index + 1}`,
          character:
            typeof player?.character === "string" ? player.character : "",
          isAlive: player?.isAlive !== false,
          isDrunk: Boolean(player?.isDrunk),
          isPoisoned: Boolean(player?.isPoisoned),
        }))
      : createDefaultPlayers(playerCount);

  return {
    wizardStep:
      Number.isInteger(persisted?.wizardStep) &&
      persisted.wizardStep >= 1 &&
      persisted.wizardStep <= 4
        ? persisted.wizardStep
        : 1,
    selectedScriptId:
      typeof persisted?.selectedScriptId === "string"
        ? persisted.selectedScriptId
        : "",
    skipAssignments:
      typeof persisted?.skipAssignments === "boolean"
        ? persisted.skipAssignments
        : true,
    playerCount,
    selectedCharacters: Array.isArray(persisted?.selectedCharacters)
      ? persisted.selectedCharacters.filter((item) => typeof item === "string")
      : [],
    drunkExtraTownsfolk:
      typeof persisted?.drunkExtraTownsfolk === "string"
        ? persisted.drunkExtraTownsfolk
        : "",
    players,
    phase:
      persisted?.phase === "running" || persisted?.phase === "between"
        ? persisted.phase
        : "idle",
    nightsCompleted:
      Number.isInteger(persisted?.nightsCompleted) &&
      persisted.nightsCompleted >= 0
        ? persisted.nightsCompleted
        : 0,
    nightIndex: Number.isInteger(persisted?.nightIndex)
      ? persisted.nightIndex
      : -1,
    dawnSummary:
      typeof persisted?.dawnSummary === "string" ? persisted.dawnSummary : "",
    reminders: {
      demonKilledId:
        typeof persisted?.reminders?.demonKilledId === "string"
          ? persisted.reminders.demonKilledId
          : "",
      monkProtectedId:
        typeof persisted?.reminders?.monkProtectedId === "string"
          ? persisted.reminders.monkProtectedId
          : "",
      notes:
        typeof persisted?.reminders?.notes === "string"
          ? persisted.reminders.notes
          : "",
    },
  };
};

function useNightHelperState() {
  const initialState = useMemo(() => buildInitialState(), []);
  const [savedPlayerNames, setSavedPlayerNames] = useState(() =>
    readSavedPlayerNames(),
  );

  const [wizardStep, setWizardStep] = useState(initialState.wizardStep);
  const [selectedScriptId, setSelectedScriptId] = useState(
    initialState.selectedScriptId,
  );
  const [skipAssignments, setSkipAssignments] = useState(
    initialState.skipAssignments,
  );
  const [playerCount, setPlayerCount] = useState(initialState.playerCount);
  const [selectedCharacters, setSelectedCharacters] = useState(
    initialState.selectedCharacters,
  );
  const [drunkExtraTownsfolk, setDrunkExtraTownsfolk] = useState(
    initialState.drunkExtraTownsfolk,
  );
  const [players, setPlayers] = useState(initialState.players);

  const [phase, setPhase] = useState(initialState.phase);
  const [nightsCompleted, setNightsCompleted] = useState(
    initialState.nightsCompleted,
  );
  const [nightIndex, setNightIndex] = useState(initialState.nightIndex);
  const [dawnSummary, setDawnSummary] = useState(initialState.dawnSummary);
  const [reminders, setReminders] = useState(initialState.reminders);

  const addNamesToSavedList = (names) => {
    const normalizedNames = (names ?? [])
      .map((name) => (typeof name === "string" ? name.trim() : ""))
      .filter(Boolean);

    if (normalizedNames.length === 0) {
      return;
    }

    setSavedPlayerNames((current) =>
      Array.from(new Set([...(current ?? []), ...normalizedNames])).slice(
        0,
        15,
      ),
    );
  };

  const addSavedPlayerName = (name) => {
    addNamesToSavedList([name]);
  };

  const removeSavedPlayerName = (name) => {
    const target = typeof name === "string" ? name.trim() : "";
    if (!target) {
      return;
    }

    setSavedPlayerNames((current) =>
      (current ?? []).filter((savedName) => savedName !== target),
    );
  };

  const removeSavedPlayerNames = (names) => {
    const targets = new Set(
      (names ?? [])
        .map((name) => (typeof name === "string" ? name.trim() : ""))
        .filter(Boolean),
    );

    if (targets.size === 0) {
      return;
    }

    setSavedPlayerNames((current) =>
      (current ?? []).filter((savedName) => !targets.has(savedName)),
    );
  };

  const addSavedPlayersToSession = (names) => {
    const selectedNames = Array.from(
      new Set(
        (names ?? [])
          .map((name) => (typeof name === "string" ? name.trim() : ""))
          .filter(Boolean),
      ),
    ).slice(0, playerCount);

    const targetCount = Math.max(5, Math.min(15, playerCount));
    setPlayers((currentPlayers) =>
      Array.from({ length: targetCount }, (_, index) => {
        const existing = currentPlayers[index];
        const selectedName = selectedNames[index];
        const fallbackName = defaultPlayerName(index);

        if (existing) {
          return {
            ...existing,
            id: index + 1,
            name: selectedName || fallbackName,
          };
        }

        return createPlayer(index + 1, selectedName || fallbackName);
      }),
    );
  };

  const fillWithDefaultPlayers = () => {
    const targetCount = Math.max(5, Math.min(15, playerCount));
    setPlayers((currentPlayers) =>
      Array.from({ length: targetCount }, (_, index) => {
        const existing = currentPlayers[index];

        if (existing) {
          return {
            ...existing,
            id: index + 1,
            name: defaultPlayerName(index),
          };
        }

        return createPlayer(index + 1, defaultPlayerName(index));
      }),
    );
  };

  const applySkipAssignmentsFromSelectedCharacters = () => {
    const roles = selectedCharacters.slice(0, playerCount);
    if (roles.length === 0) {
      return;
    }

    setPlayers(
      roles.map((role, index) => createRoleNamedPlayer(index + 1, role)),
    );
  };

  const selectedScript = useMemo(
    () =>
      SCRIPT_OPTIONS.find((script) => script.id === selectedScriptId) ?? null,
    [selectedScriptId],
  );

  const categories = useMemo(
    () =>
      selectedScript?.categories ?? {
        townsfolk: [],
        outsider: [],
        minion: [],
        imp: [],
      },
    [selectedScript],
  );

  const currentNightType = nightsCompleted === 0 ? "first" : "other";
  const currentOrder =
    currentNightType === "first"
      ? (selectedScript?.firstNightOrder ?? [])
      : (selectedScript?.otherNightOrder ?? []);

  const baseExpectedSetup =
    selectedScript?.getExpectedSetup(playerCount) ?? null;
  const expectedSetup = applyBaronAdjustment(
    baseExpectedSetup,
    selectedCharacters,
  );

  const selectedByCategory = useMemo(
    () => ({
      townsfolk: selectedCharacters.filter((character) =>
        categories.townsfolk.includes(character),
      ).length,
      outsider: selectedCharacters.filter((character) =>
        categories.outsider.includes(character),
      ).length,
      minion: selectedCharacters.filter((character) =>
        categories.minion.includes(character),
      ).length,
      imp: selectedCharacters.filter((character) =>
        categories.imp.includes(character),
      ).length,
    }),
    [categories, selectedCharacters],
  );

  const hasMinion = useMemo(
    () =>
      selectedCharacters.some((character) =>
        selectedScript?.minionRoles.has(character),
      ),
    [selectedCharacters, selectedScript],
  );

  const hasDemon = useMemo(
    () =>
      selectedCharacters.some((character) =>
        selectedScript?.demonRoles.has(character),
      ),
    [selectedCharacters, selectedScript],
  );

  const currentRole =
    phase === "running" && nightIndex >= 0 ? currentOrder[nightIndex] : "";

  const currentRolePlayers = useMemo(() => {
    if (
      !currentRole ||
      currentRole === "Minion Info" ||
      currentRole === "Demon Info"
    ) {
      return [];
    }

    const assignedPlayers = players.filter(
      (player) => player.character === currentRole,
    );

    if (
      selectedCharacters.includes("Drunk") &&
      drunkExtraTownsfolk &&
      currentRole === drunkExtraTownsfolk
    ) {
      const drunkPlayers = players.filter(
        (player) => player.character === "Drunk",
      );
      return [...assignedPlayers, ...drunkPlayers];
    }

    return assignedPlayers;
  }, [currentRole, players, selectedCharacters, drunkExtraTownsfolk]);

  const currentRoleDroisoned = currentRolePlayers.some(
    (player) =>
      player.isDrunk ||
      player.isPoisoned ||
      (player.character === "Drunk" && currentRole === drunkExtraTownsfolk),
  );

  const setPlayerField = (id, field, value) => {
    if (field === "name") {
      const trimmed = typeof value === "string" ? value.trim() : "";
      const defaultName = `Player ${id}`;

      if (trimmed && trimmed !== defaultName) {
        addNamesToSavedList([trimmed]);
      }
    }

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => {
        if (player.id !== id) {
          return player;
        }

        return { ...player, [field]: value };
      }),
    );
  };

  const togglePlayerFlag = (id, field) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === id ? { ...player, [field]: !player[field] } : player,
      ),
    );
  };

  const addPlayer = () => {
    if (players.length >= 15) {
      return;
    }

    const newCount = players.length + 1;
    setPlayerCount(newCount);
    setPlayers((currentPlayers) => [
      ...currentPlayers,
      createPlayer(currentPlayers.length + 1),
    ]);
  };

  const applyPlayerCount = (nextCount) => {
    const normalized = Math.max(5, Math.min(15, nextCount));
    setPlayerCount(normalized);
    setPlayers((currentPlayers) => {
      const resized = Array.from({ length: normalized }, (_, index) => {
        const existing = currentPlayers[index];
        if (existing) {
          return { ...existing, id: index + 1 };
        }
        return createPlayer(index + 1);
      });
      return resized;
    });
  };

  const toggleCharacterInGame = (character) => {
    setSelectedCharacters((currentCharacters) => {
      if (currentCharacters.includes(character)) {
        if (character === "Drunk") {
          setDrunkExtraTownsfolk("");
        }
        return currentCharacters.filter((item) => item !== character);
      }
      return [...currentCharacters, character];
    });
  };

  const quickFillRecommendedCharacters = () => {
    if (!expectedSetup) {
      return;
    }

    const preferBaron =
      selectedCharacters.includes("Baron") && expectedSetup.minion > 0;

    const recommended = [
      ...pickCharacters(categories.townsfolk, expectedSetup.townsfolk),
      ...pickCharacters(categories.outsider, expectedSetup.outsider),
      ...pickCharacters(
        categories.minion,
        expectedSetup.minion,
        preferBaron ? ["Baron"] : [],
      ),
      ...pickCharacters(categories.imp, expectedSetup.imp),
    ];

    const allCharacters = [
      ...categories.townsfolk,
      ...categories.outsider,
      ...categories.minion,
      ...categories.imp,
    ];

    for (const character of allCharacters) {
      if (recommended.length >= playerCount) {
        break;
      }

      if (!recommended.includes(character)) {
        recommended.push(character);
      }
    }

    setSelectedCharacters(recommended.slice(0, playerCount));
  };

  const isRoleActiveForNight = (roleName) => {
    if (roleName === "Minion Info") {
      return hasMinion && hasDemon;
    }

    if (roleName === "Demon Info") {
      return hasDemon && hasMinion;
    }

    const isDrunkExtraRole =
      selectedCharacters.includes("Drunk") &&
      drunkExtraTownsfolk &&
      roleName === drunkExtraTownsfolk;

    if (!selectedCharacters.includes(roleName) && !isDrunkExtraRole) {
      return false;
    }

    const assignedPlayers = [
      ...players.filter((player) => player.character === roleName),
      ...(isDrunkExtraRole
        ? players.filter((player) => player.character === "Drunk")
        : []),
    ];

    if (assignedPlayers.length === 0) {
      return true;
    }

    return assignedPlayers.some(
      (player) =>
        player.isAlive || selectedScript?.deadAbilityRoles.has(roleName),
    );
  };

  const getNextNightIndex = (startIndex) => {
    for (let index = startIndex; index < currentOrder.length; index += 1) {
      if (isRoleActiveForNight(currentOrder[index])) {
        return index;
      }
    }
    return -1;
  };

  const startNight = () => {
    if (!selectedScript) {
      return;
    }

    const firstIndex = getNextNightIndex(0);
    setDawnSummary("");

    if (firstIndex === -1) {
      setPhase("between");
      setDawnSummary("No active roles this night. Move to day phase.");
      return;
    }

    setNightIndex(firstIndex);
    setPhase("running");
  };

  const endNight = () => {
    const deadNames = [];
    let updatedPlayers = players;
    let killOutcome = "none";

    if (reminders.demonKilledId) {
      const killedId = Number(reminders.demonKilledId);
      const protectedId = Number(reminders.monkProtectedId || 0);

      if (killedId === protectedId) {
        killOutcome = "protected";
      } else {
        const targetPlayer = players.find((player) => player.id === killedId);

        if (targetPlayer && !targetPlayer.isAlive) {
          killOutcome = "already-dead";
        } else {
          killOutcome = "killed";
        }

        updatedPlayers = players.map((player) => {
          if (player.id !== killedId) {
            return player;
          }

          if (player.isAlive) {
            deadNames.push(player.name);
          }

          return { ...player, isAlive: false };
        });
      }
    }

    setPlayers(updatedPlayers);

    setDawnSummary(
      deadNames.length > 0
        ? `These players died: ${deadNames.join(", ")}. Wake the town.`
        : killOutcome === "protected"
          ? "These players died: nobody (target was protected). Wake the town."
          : killOutcome === "already-dead"
            ? "These players died: nobody (target was already dead). Wake the town."
            : "These players died: nobody. Wake the town.",
    );

    setReminders({
      demonKilledId: "",
      monkProtectedId: "",
      notes: "",
    });

    setNightIndex(-1);
    setPhase("between");
    setNightsCompleted((count) => count + 1);
  };

  const advanceNightRole = () => {
    const nextIndex = getNextNightIndex(nightIndex + 1);
    if (nextIndex === -1) {
      endNight();
      return;
    }
    setNightIndex(nextIndex);
  };

  const stepReady = {
    1: Boolean(selectedScript),
    2:
      selectedCharacters.length === playerCount &&
      (!selectedCharacters.includes("Drunk") || Boolean(drunkExtraTownsfolk)) &&
      (!expectedSetup ||
        (selectedByCategory.townsfolk === expectedSetup.townsfolk &&
          selectedByCategory.outsider === expectedSetup.outsider &&
          selectedByCategory.minion === expectedSetup.minion &&
          selectedByCategory.imp === expectedSetup.imp)),
    3: skipAssignments || players.every((player) => Boolean(player.character)),
  };

  const roleCountLabel = (name, selected, expected) =>
    `${name}: ${selected}/${expected ?? "-"}`;

  const getAssignableOptions = (playerId, currentCharacter) => {
    const assignedByOthers = new Set(
      players
        .filter((player) => player.id !== playerId && player.character)
        .map((player) => player.character),
    );

    return selectedCharacters.filter(
      (character) =>
        character === currentCharacter || !assignedByOthers.has(character),
    );
  };

  useEffect(() => {
    writeSavedPlayerNames(savedPlayerNames);
  }, [savedPlayerNames]);

  useEffect(() => {
    const stateToPersist = {
      wizardStep,
      selectedScriptId,
      skipAssignments,
      playerCount,
      selectedCharacters,
      drunkExtraTownsfolk,
      players,
      phase,
      nightsCompleted,
      nightIndex,
      dawnSummary,
      reminders,
    };

    try {
      writeCookie(
        COOKIE_NAME,
        JSON.stringify(stateToPersist),
        COOKIE_MAX_AGE_SECONDS,
      );
    } catch {
      // Ignore cookie write issues.
    }
  }, [
    wizardStep,
    selectedScriptId,
    skipAssignments,
    playerCount,
    selectedCharacters,
    drunkExtraTownsfolk,
    players,
    phase,
    nightsCompleted,
    nightIndex,
    dawnSummary,
    reminders,
  ]);

  const resetGame = () => {
    const confirmed = window.confirm(
      "Reset the current game? This will clear all saved progress.",
    );
    if (!confirmed) {
      return;
    }

    setWizardStep(1);
    setSelectedScriptId("");
    setSkipAssignments(true);
    setPlayerCount(8);
    setSelectedCharacters([]);
    setDrunkExtraTownsfolk("");
    setPlayers(createDefaultPlayers(8));
    setPhase("idle");
    setNightsCompleted(0);
    setNightIndex(-1);
    setDawnSummary("");
    setReminders({
      demonKilledId: "",
      monkProtectedId: "",
      notes: "",
    });

    deleteCookie(COOKIE_NAME);
  };

  const navigateWizardStep = (nextStep) => {
    if (skipAssignments && nextStep === 3) {
      setWizardStep(4);
      return;
    }

    if (skipAssignments && nextStep === 4) {
      applySkipAssignmentsFromSelectedCharacters();
    }

    setWizardStep(nextStep);
  };

  const wizard = {
    wizardStep,
    setWizardStep: navigateWizardStep,
    skipAssignments,
    stepReady,
    resetGame,
  };

  const setup = {
    selectedScript,
    selectedScriptId,
    setSelectedScriptId,
    skipAssignments,
    setSkipAssignments,
    playerCount,
    applyPlayerCount,
    selectedCharacters,
    setSelectedCharacters,
    drunkExtraTownsfolk,
    setDrunkExtraTownsfolk,
    categories,
    selectedByCategory,
    expectedSetup,
    roleCountLabel,
    toggleCharacterInGame,
    quickFillRecommendedCharacters,
    savedPlayerNames,
    addSavedPlayerName,
    removeSavedPlayerName,
    removeSavedPlayerNames,
    addSavedPlayersToSession,
    fillWithDefaultPlayers,
    applySkipAssignmentsFromSelectedCharacters,
    players,
    setPlayers,
    addPlayer,
    setPlayerField,
    getAssignableOptions,
  };

  const nightFlow = {
    phase,
    currentNightType,
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
  };

  return { wizard, setup, nightFlow };
}

export default useNightHelperState;
