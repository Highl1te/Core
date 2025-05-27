import { Plugin } from "../core/interfaces/highlite/plugin/plugin.class";
import { PluginSettings } from "../core/interfaces/highlite/plugin/pluginSettings.interface";
import { PanelManager } from "../core/managers/highlite/panelManager";

export class ExperienceTracker extends Plugin {
    pluginName: string = "Experience Tracker";
    panelManager : PanelManager = new PanelManager();
    panelContent : HTMLElement | null = null;

    levelToXP = {
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
        "ranged": "🏹",
        "fishing": "🎣",
        "mining": "⛏️",
        "smithing": "🔨",
        "cooking": "🍳",
        "woodcutting": "🌳",
        "crafting": "🧵",
        "harvesting": "🌾",
        "crime": "🥷",
        "enchanting": "✨",
        "potionmaking": "🧪",
    }

    start(): void {
        if (!this.settings.enable.value) {
            return;
        }
        this.panelContent = this.panelManager.requestMenuItem('📊', "Experience Tracker");
        this.panelContent.style.display = "flex";
        this.panelContent.style.flexDirection = "column";
        this.panelContent.style.width = "100%";
        this.panelContent.style.height = "100%";

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
        this.log(skillIcon);
    }
    stop(): void {
        this.panelManager.removeMenuItem('📊');
        this.log(`Stopped`);
    }

    init(): void {
        this.log(`Initialized`);
    }
}