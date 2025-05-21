export class NotificationManager {
    private static instance: NotificationManager;
    canNotify : boolean = false;

    constructor() {
        if (NotificationManager.instance) {
            return NotificationManager.instance;
        }
        NotificationManager.instance = this;
        document.highlite.managers.NotificationManager = this;
    }


    createNotification(message: string, onClick : Function = () => { window.focus();}) : boolean {
        if (!this.canNotify) {
            return false;
        }

        const notification = new Notification("Highlite", {
            body: message
        });
        notification.onclick = () => {
            onClick();
        }

        return true;
    }

    async askNotificationPermission() {
        // Check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("[Highlite] This browser does not support notifications.");
            this.canNotify = false;
        }

        if (Notification.permission === "granted") {
            console.log("[Highlite] Notification permission granted.");
            this.canNotify = true;
        } else if (Notification.permission === "denied") {
            console.log("[Highlite] Notification permission denied.");
            this.canNotify = false;
        } else {
            console.log("[Highlite] Notification permission dismissed.");
            this.canNotify = false;
        }
    }
}