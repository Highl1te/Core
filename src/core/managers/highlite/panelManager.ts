import { UIManager, UIManagerScope} from "./uiManager";

export class PanelManager {
    private static instance: PanelManager;
    private uiManager!: UIManager;
    private highliteBar: HTMLElement | null = null;
    private highliteBarSelectedContent: HTMLElement | null = null;

    private currentMenuItem: string | null = null;

    private barContentPages : {
        [key: string]: HTMLElement;
    } = {};

    constructor() {
        if (PanelManager.instance) {
            return PanelManager.instance;
        }
        PanelManager.instance = this;
        this.uiManager = new UIManager();
        document.highlite.managers.PanelManager = this;
        this.setup();
    }
    
    setup() {
        this.highliteBarSelectedContent = this.uiManager.createElement(UIManagerScope.ClientRelative)
        this.highliteBar = this.uiManager.createElement(UIManagerScope.ClientRelative)

        this.highliteBar.classList.add("highlite_bar");
        this.highliteBarSelectedContent.classList.add("highlite_bar_selected_content");

        const title = document.createElement("div");
        title.classList.add("content_title");
        const titleText = document.createElement("span");
        titleText.id = "selectedContentTitle";
        title.appendChild(titleText);

        this.highliteBarSelectedContent.appendChild(title);

        const contentDiv = document.createElement("div");
        contentDiv.id = "selectedContentDiv";
        contentDiv.classList.add("content");
        this.highliteBarSelectedContent.appendChild(contentDiv);
    }

    requestMenuItem(icon: string, title: string) {
        // Verify an equivalent icon does not exist
        if (this.barContentPages[icon]) {
            throw new Error(`[Highlite] Bar Icon ${icon} already exists`);
        }

        const iconElement = document.createElement("div");
        iconElement.classList.add("highlite_bar_item");
        iconElement.innerHTML = icon;
        iconElement.addEventListener("click", () => {
            console.warn(`[Highlite] Bar Icon ${icon} clicked`);
            if (this.currentMenuItem === icon) {
                this.highliteBarSelectedContent?.classList.remove("activated")
                this.currentMenuItem = null;
                window.dispatchEvent(new Event("resize"));
                return;
            }
            this.currentMenuItem = icon;
            this.highliteBarSelectedContent?.classList.add("activated");
            window.dispatchEvent(new Event("resize"));
            // Set the title
            const titleElement = this.highliteBarSelectedContent?.querySelector("#selectedContentTitle")
            if (titleElement) {
                titleElement.innerHTML = title;
            }

            // Set the content
            const contentElement = this.highliteBarSelectedContent?.querySelector("#selectedContentDiv")
            if (contentElement) {
                contentElement.innerHTML = "";
                const pageContent = this.barContentPages[icon];
                if (pageContent) {
                    contentElement.appendChild(pageContent);
                }
            }
        });
        this.highliteBar?.appendChild(iconElement);
        
        const contentElement = document.createElement("div");
        this.barContentPages[icon] = contentElement;
        return this.barContentPages[icon];
    }
}