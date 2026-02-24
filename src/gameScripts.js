export class ScriptDefinition {
  constructor({
    id,
    name,
    categories,
    firstNightOrder,
    otherNightOrder,
    rolePrompts,
    roleCountsByPlayers,
    minionRoles,
    demonRoles,
    deadAbilityRoles,
  }) {
    this.id = id;
    this.name = name;
    this.categories = categories;
    this.firstNightOrder = firstNightOrder;
    this.otherNightOrder = otherNightOrder;
    this.rolePrompts = rolePrompts;
    this.roleCountsByPlayers = roleCountsByPlayers;
    this.minionRoles = new Set(minionRoles);
    this.demonRoles = new Set(demonRoles);
    this.deadAbilityRoles = new Set(deadAbilityRoles);
  }

  getAllCharacters() {
    return [
      ...this.categories.townsfolk,
      ...this.categories.outsider,
      ...this.categories.minion,
      ...this.categories.imp,
    ];
  }

  getExpectedSetup(playerCount) {
    return this.roleCountsByPlayers[playerCount] ?? null;
  }
}

export const TROUBLE_BREWING_SCRIPT = new ScriptDefinition({
  id: "trouble-brewing",
  name: "Trouble Brewing",
  categories: {
    townsfolk: [
      "Washerwoman",
      "Librarian",
      "Investigator",
      "Chef",
      "Empath",
      "Fortune Teller",
      "Undertaker",
      "Monk",
      "Ravenkeeper",
      "Virgin",
      "Slayer",
      "Soldier",
      "Mayor",
    ],
    outsider: ["Butler", "Drunk", "Recluse", "Saint"],
    minion: ["Poisoner", "Spy", "Scarlet Woman", "Baron"],
    imp: ["Imp"],
  },
  firstNightOrder: [
    "Minion Info",
    "Demon Info",
    "Poisoner",
    "Spy",
    "Washerwoman",
    "Librarian",
    "Investigator",
    "Chef",
    "Empath",
    "Fortune Teller",
    "Butler",
  ],
  otherNightOrder: [
    "Poisoner",
    "Monk",
    "Spy",
    "Scarlet Woman",
    "Imp",
    "Ravenkeeper",
    "Undertaker",
    "Empath",
    "Fortune Teller",
    "Butler",
  ],
  rolePrompts: {
    "Minion Info":
      "Minion Info: Wake all Minions. Show each other and identify the Demon.",
    "Demon Info": "Demon Info: Wake the Demon and show the Minions.",
    Poisoner: "Poisoner: Choose one player to poison tonight.",
    Spy: "Spy: You may see the grim.",
    Washerwoman:
      "Washerwoman: Show two players, one of whom is that Townsfolk.",
    Librarian:
      "Librarian: Show two players, one of whom is that Outsider (or no Outsiders).",
    Investigator: "Investigator: Show two players, one of whom is that Minion.",
    Chef: "Chef: Give number of adjacent evil pairs.",
    Empath: "Empath: Show number of evil alive neighbors.",
    "Fortune Teller": "Fortune Teller: Choose two players. Show YES or NO.",
    Butler: "Butler: Choose your master for tomorrow.",
    Monk: "Monk: Who do you protect?",
    "Scarlet Woman":
      "Scarlet Woman: Check if Demon replacement trigger applies.",
    Imp: "Imp: Choose a player to kill.",
    Ravenkeeper: "Ravenkeeper: If killed tonight, choose a player to learn.",
    Undertaker: "Undertaker: Learn executed player character.",
  },
  roleCountsByPlayers: {
    5: { townsfolk: 3, outsider: 0, minion: 1, imp: 1 },
    6: { townsfolk: 3, outsider: 1, minion: 1, imp: 1 },
    7: { townsfolk: 5, outsider: 0, minion: 1, imp: 1 },
    8: { townsfolk: 5, outsider: 1, minion: 1, imp: 1 },
    9: { townsfolk: 5, outsider: 2, minion: 1, imp: 1 },
    10: { townsfolk: 7, outsider: 0, minion: 2, imp: 1 },
    11: { townsfolk: 7, outsider: 1, minion: 2, imp: 1 },
    12: { townsfolk: 7, outsider: 2, minion: 2, imp: 1 },
    13: { townsfolk: 9, outsider: 0, minion: 3, imp: 1 },
    14: { townsfolk: 9, outsider: 1, minion: 3, imp: 1 },
    15: { townsfolk: 9, outsider: 2, minion: 3, imp: 1 },
  },
  minionRoles: ["Poisoner", "Spy", "Scarlet Woman", "Baron"],
  demonRoles: ["Imp"],
  deadAbilityRoles: ["Ravenkeeper"],
});

export const SCRIPT_OPTIONS = [TROUBLE_BREWING_SCRIPT];
