import { Plugin } from "../core/interfaces/highlite/plugin/plugin.class";
import { PluginSettings } from "../core/interfaces/highlite/plugin/pluginSettings.interface";
import { PanelManager } from "../core/managers/highlite/panelManager";

export class ExperienceTracker extends Plugin {
    pluginName: string = "Experience Tracker";
    panelManager : PanelManager = new PanelManager();
    panelContent : HTMLElement | undefined = undefined;

    levelToXP = {
        1: 0,
        2: 99,
        3: 210,
        4: 333,
        5: 470,
        6: 622,
        7: 791,
        8: 978,
        9: 1185,
        10: 1414,
        11: 1667,
        12: 1947,
        13: 2256,
        14: 2598,
        15: 2976,
        16: 3393,
        17: 3854,
        18: 4363,
        19: 4925,
        20: 5546,
        21: 6232,
        22: 6989,
        23: 7825,
        24: 8749,
        25: 9769,
        26: 10896,
        27: 12141,
        28: 13516,
        29: 15035,
        30: 16713,
        31: 18567,
        32: 20616,
        33: 22880,
        34: 25382,
        35: 28147,
        36: 31202,
        37: 34579,
        38: 38311,
        39: 42436,
        40: 46996,
        41: 52037,
        42: 57609,
        43: 63769,
        44: 70579,
        45: 78108,
        46: 86433,
        47: 95637,
        48: 105814,
        49: 117067,
        50: 129510,
        51: 143269,
        52: 158484,
        53: 175309,
        54: 193915,
        55: 214491,
        56: 237246,
        57: 262410,
        58: 290240,
        59: 321018,
        60: 355057,
        61: 392703,
        62: 434338,
        63: 480386,
        64: 531315,
        65: 587643,
        66: 649943,
        67: 718848,
        68: 795059,
        69: 879351,
        70: 972582,
        71: 1075701,
        72: 1189756,
        73: 1315908,
        74: 1455440,
        75: 1609773,
        76: 1780476,
        77: 1969287,
        78: 2178128,
        79: 2409124,
        80: 2664626,
        81: 2947234,
        82: 3259825,
        83: 3605580,
        84: 3988019,
        85: 4411034,
        86: 4878932,
        87: 5396475,
        88: 5968931,
        89: 6602127,
        90: 7302510,
        91: 8077208,
        92: 8934109,
        93: 9881935,
        94: 10930335,
        95: 12089982,
        96: 13372681,
        97: 14791491,
        98: 16360855,
        99: 18096750,
        100: 20016848
    };

    skillToIcon = {
        "hitpoints": "💖",
        "accuracy": "🎯",
        "strength": "💪",
        "defense": "🛡️",
        "magic": "🔮",
        "range": "🏹",
        "fishing": "🎣",
        "mining": "⛏️",
        "smithing": "🔨",
        "cooking": "🍳",
        "forestry": "🌳",
        "crafting": "🧵",
        "harvesting": "🌾",
        "crime": "🥷",
        "enchanting": "✨",
        "potionmaking": "🧪",
    }

    skillTrackers : {
        [skillName: string]: {
            trackerElement: HTMLElement,
            trackedActions: number,
            trackedXPGained: number,
            previousXP: number,
        }
    } = {};

    start(): void {
        if (!this.settings.enable.value) {
            return;
        }
        this.panelContent = this.panelManager.requestMenuItem('📊', "Experience Tracker")[1];
        if (!this.panelContent) {
            this.log(`Failed to create Experience Tracker panel`);
            return;
        }
        this.panelContent.style.display = "block";
        this.panelContent.style.flexDirection = "column";
        this.panelContent.style.width = "100%";
        this.panelContent.style.height = "-webkit-fill-available";
        
        this.log(`Started`);
    }

    SocketManager_loggedIn() {
        const resourceSkills = this.gameHooks.EntityManager.Instance.MainPlayer.Skills._skills;
        resourceSkills.forEach(skill => {
            this.createSkillListing(skill);
        })

        const combatSkills = this.gameHooks.EntityManager.Instance.MainPlayer.Combat._skills;
        combatSkills.forEach(skill => {
            this.createSkillListing(skill);
        })
    }

    createSkillListing(skill) {
        const skillName : string = this.gameLookups["Skills"][skill._skill];
        const skillIcon = this.skillToIcon[skillName];


        const skillTracker = document.createElement('div');
        skillTracker.style.display = "flex";
        skillTracker.style.flexDirection = "column";
        skillTracker.style.margin = "5px";
        skillTracker.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
        skillTracker.style.padding = "5px";
        skillTracker.style.borderRadius = "10px";

        const skillHeader = document.createElement('div');
        skillHeader.style.display = "flex";
        skillHeader.style.flexDirection = "row";
        skillHeader.style.padding = "5px 0px";
        skillTracker.appendChild(skillHeader);

        const skillIconElement = document.createElement('div');
        skillIconElement.textContent = skillIcon;

        skillIconElement.style.fontSize = "30px";
        skillIconElement.style.backgroundColor = "#80808069";
        skillIconElement.style.borderRadius = "360px";
        skillIconElement.style.padding = "5px";
        skillIconElement.style.textShadow = "0.0625rem 0.0625rem 0 black";
        skillIconElement.style.marginRight = "5px";
        skillIconElement.style.textWrapMode = "nowrap";
        skillHeader.appendChild(skillIconElement);
        
        const xpDetails = document.createElement('div');
        xpDetails.style.display = "flex";
        xpDetails.style.flexDirection = "column";
        xpDetails.style.width = "100%";
        xpDetails.style.textWrapMode = "nowrap";
        skillHeader.appendChild(xpDetails);


        const xpDetailsLeft = document.createElement('div');
        xpDetailsLeft.style.display = "flex";
        xpDetailsLeft.style.flexDirection = "row";
        xpDetailsLeft.style.justifyContent = "space-around";


        const skillXPGained = document.createElement('div');
        skillXPGained.id = `skillXPGained`;
        skillXPGained.textContent = `XP Gained: 0`;
        skillXPGained.style.fontSize = "12px";
        const skillXPLeft = document.createElement('div');
        skillXPLeft.id = `skillXPLeft`;
        skillXPLeft.textContent = `XP Left: ${this.levelToXP[skill._level + 1] - skill._xp}`;
        skillXPLeft.style.fontSize = "12px";
        xpDetailsLeft.appendChild(skillXPGained);
        xpDetailsLeft.appendChild(skillXPLeft);

        const xpDetailsRight = document.createElement('div');
        xpDetailsRight.style.display = "flex";
        xpDetailsRight.style.flexDirection = "row";
        xpDetailsRight.style.justifyContent = "space-around";


        const skillXPPerHour = document.createElement('div');
        skillXPPerHour.id = `skillXPPerHour`;
        skillXPPerHour.textContent = `XP/Hour: 0`;
        skillXPPerHour.style.fontSize = "12px";
        const skillActionsLeft = document.createElement('div');
        skillActionsLeft.id = `skillActionsLeft`;
        skillActionsLeft.textContent = `Actions: 0`;
        skillActionsLeft.style.fontSize = "12px";
        xpDetailsRight.appendChild(skillXPPerHour);
        xpDetailsRight.appendChild(skillActionsLeft);
        
        xpDetails.appendChild(xpDetailsLeft);
        xpDetails.appendChild(xpDetailsRight);

        // XP Bar
        const xpProgressBar = document.createElement('div');
        xpProgressBar.style.width = "100%";
        xpProgressBar.style.height = "10px";
        xpProgressBar.style.backgroundColor = "#80808069";
        xpProgressBar.style.borderRadius = "5px";
        xpProgressBar.style.marginTop = "5px";
        xpProgressBar.style.overflow = "hidden";
        const xpProgress = document.createElement('div');
        xpProgress.style.width = `${(skill._xp / this.levelToXP[skill._level + 1]) * 100}%`;
        xpProgress.id = `xpProgress`;
        xpProgress.style.height = "100%";
        xpProgress.style.backgroundColor = "rgb(82 209 82)";
        xpProgress.style.transition = "width 0.5s ease-in-out";
        xpProgressBar.appendChild(xpProgress);
        xpDetails.appendChild(xpProgressBar);

        this.skillTrackers[skillName] = {
            trackerElement: skillTracker,
            trackedActions: 0,
            trackedXPGained: 0,
            previousXP: skill._xp
        };

        // When the user hovers over the skill tracker, show a button in the middle of the tracker to hide it
        skillTracker.addEventListener('mouseenter', () => {
            const hideButton = document.createElement('div');
            hideButton.textContent = "Hide";
            hideButton.id = "hideSkillTrackerButton";
            hideButton.style.position = 'absolute';
            hideButton.style.left = '50%';
            hideButton.style.transform = 'translate(-50%, 50%)';
            hideButton.style.backgroundColor = 'rgb(65 65 65)';
            hideButton.style.padding = '5px 10px';
            hideButton.style.borderRadius = '5px';
            hideButton.style.cursor = 'pointer';
            hideButton.addEventListener('click', () => {
                skillTracker.style.display = "none"; // Hide the tracker
            });
            skillTracker.appendChild(hideButton);
        });

        skillTracker.addEventListener('mouseleave', () => {
            const hideButton = skillTracker.querySelector('#hideSkillTrackerButton');
            if (hideButton) {
                skillTracker.removeChild(hideButton);
            }
        });


        skillTracker.style.display = "none";
        this.panelContent?.appendChild(skillTracker);
    }

    updateSkillListing(skill) {
      const skillName : string = this.gameLookups["Skills"][skill._skill];
      let skillTracker = this.skillTrackers[skillName];

      if (!skillTracker) {
          this.createSkillListing(skill);
          skillTracker = this.skillTrackers[skillName];
      }

      if (!skillTracker) {
          return;
      }

      if (skill._xp === skillTracker.previousXP) {
          return; // No change in XP, no need to update
      }

      skillTracker.trackerElement.style.display = "flex"; // Show the tracker if it was hidden


      const xpGained = skill._xp - skillTracker.previousXP; // Also XP per Action
      skillTracker.trackedXPGained += xpGained;
      skillTracker.trackedActions += 1;
      skillTracker.previousXP = skill._xp;

      // Update new values in the tracker
      const skillXPGained = skillTracker.trackerElement.querySelector('#skillXPGained');
      const skillXPLeft = skillTracker.trackerElement.querySelector('#skillXPLeft');
      const skillXPPerHour = skillTracker.trackerElement.querySelector('#skillXPPerHour');
      const skillActionsLeft = skillTracker.trackerElement.querySelector('#skillActionsLeft');
      const xpProgress = skillTracker.trackerElement.querySelector('#xpProgress');

      if (skillXPGained) {
          skillXPGained.textContent = `XP Gained: ${skillTracker.trackedXPGained}`;
      }

      if (skillXPLeft) {
          skillXPLeft.textContent = `XP Left: ${this.levelToXP[skill._level + 1] - skill._xp}`;
      }

      if (skillXPPerHour) {
          const xpPerHour = 'TODO';
          skillXPPerHour.textContent = `XP/Action : ${Math.floor(skillTracker.trackedXPGained / skillTracker.trackedActions)}`;
      }

      if (skillActionsLeft) {
          skillActionsLeft.textContent = `Actions: ${Math.ceil((this.levelToXP[skill._level + 1] - skill._xp) / (skillTracker.trackedXPGained / skillTracker.trackedActions))}`;
      }

      if (xpProgress) {
          xpProgress.style.width = `${(skill._xp / this.levelToXP[skill._level + 1]) * 100}%`;
      }


    }

    GameLoop_update(...args: any) {
      if (!this.settings.enable.value) {
          return;
      }

      const resourceSkills = this.gameHooks.EntityManager.Instance.MainPlayer.Skills._skills;
      resourceSkills.forEach(skill => {
          this.updateSkillListing(skill);
      })

      const combatSkills = this.gameHooks.EntityManager.Instance.MainPlayer.Combat._skills;
      combatSkills.forEach(skill => {
          this.updateSkillListing(skill);
      })
    }


    stop(): void {
        this.panelManager.removeMenuItem('📊');
        this.skillTrackers = {};
        this.log(`Stopped`);
    }

    init(): void {
        this.log(`Initialized`);
    }
}
