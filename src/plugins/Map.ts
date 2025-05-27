import { Plugin } from "../core/interfaces/highlite/plugin/plugin.class";
import { PanelManager } from "../core/managers/highlite/panelManager";

export class WorldMap extends Plugin {
    pluginName: string = "World Map";
    panelManager : PanelManager = new PanelManager();

    init(): void {
        this.log("Initializing");
    }

    start(): void {
        this.log("Started");
        const contentDiv = this.panelManager.requestMenuItem("🗺️", "World Map");
        
        if (contentDiv) {
            const mapButton = document.createElement("button");
            mapButton.textContent = "Open World Map";
            mapButton.style.width = "100%";
            mapButton.style.height = "100%";
            mapButton.style.fontSize = "16px";
            mapButton.style.cursor = "pointer";
            mapButton.onclick = () => {
                this.doTest();
            };
            
            contentDiv.appendChild(mapButton);
            this.log("World Map panel created successfully.");
        } else {
            console.error("Failed to create World Map panel.");
        }
    }

    doTest() {
        // Create a window in the middle of the screen which embeds the map: https://highlite.fanet.dev/map
        const mapWindow = document.createElement("div");
        mapWindow.style.position = "fixed";
        mapWindow.style.top = "50%";
        mapWindow.style.left = "50%";
        mapWindow.style.transform = "translate(-50%, -50%)";
        mapWindow.style.width = "50%";
        mapWindow.style.height = "50%";
        mapWindow.style.backgroundColor = "white";
        mapWindow.style.zIndex = "1000";
        mapWindow.style.border = "2px solid black";
        mapWindow.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
        mapWindow.style.display = "flex";
        mapWindow.style.justifyContent = "center";
        mapWindow.style.alignItems = "center";
        document.body.appendChild(mapWindow);


        // Player Map Level, Player Map X, Player Map Y
        if (!this.gameHooks.EntityManager.Instance.MainPlayer) {
            this.log("Main player not found, cannot display map.");
            return;
        }

        const playerMapLevel = this.gameHooks.EntityManager.Instance.MainPlayer.CurrentMapLevel;
        const playerMapPos = this.gameHooks.EntityManager.Instance.MainPlayer.CurrentGamePosition;
        const mapLevelText = playerMapLevel == 1 ? "Overworld" : playerMapLevel == 0 ? "Underworld" : "Sky";

        /* https://highlite.fanet.dev/map?lvl=Overworld&pos_x=500&pos_y=500 */
        const embed = document.createElement("embed");
        embed.src = `https://highlite.fanet.dev/map?lvl=${mapLevelText}&pos_x=${playerMapPos.X + 512}&pos_y=${playerMapPos.Z + 512}`;
        embed.style.width = "100%";
        embed.style.height = "100%";
        embed.style.border = "none";
        mapWindow.appendChild(embed);



        // Add a close button to the map window
        /* <div style="position: absolute;top: -5px;right: -5px;z-index: 100000000;background: red;color: white;box-shadow: none;padding: 5px;font-family: 'Inter';height: 10px;width: 10px;overflow: visible;text-align: center;justify-content: center;display: flex;align-items: center;border-radius: 5px;text-shadow: 0px 0px 4px black;cursor: pointer;">✕</div>*/
        const closeButton = document.createElement("div");
        closeButton.style.position = "absolute";
        closeButton.style.top = "-5px";
        closeButton.style.right = "-5px";
        closeButton.style.zIndex = "100000000";
        closeButton.style.background = "red";
        closeButton.style.color = "white";
        closeButton.style.boxShadow = "none";
        closeButton.style.padding = "5px";
        closeButton.style.fontFamily = "'Inter'";
        closeButton.style.height = "10px";
        closeButton.style.width = "10px";
        closeButton.style.overflow = "visible";
        closeButton.style.textAlign = "center";
        closeButton.style.justifyContent = "center";
        closeButton.style.display = "flex";
        closeButton.style.alignItems = "center";
        closeButton.style.borderRadius = "5px";
        closeButton.style.textShadow = "0px 0px 4px black";
        closeButton.style.cursor = "pointer";
        closeButton.textContent = "✕";
        closeButton.onclick = () => {
            document.body.removeChild(mapWindow);
        };
        
        mapWindow.appendChild(closeButton);

    }

    stop(): void {
        this.log("Stopped");
    }


}
