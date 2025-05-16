export class NotificationHelper {
    static canNotify : boolean = false;

    static showNotification(message: string) {
        if (NotificationHelper.canNotify) {
            const notification = new Notification("Highlite", {
                body: message
            });
            notification.onclick = () => {
                window.focus();
            };
        }
    }

    static async askNotificationPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        console.log("[Highlite] This browser does not support notifications.");
        NotificationHelper.canNotify = false;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        console.log("[Highlite] Notification permission granted.");
        NotificationHelper.canNotify = true;
    } else if (permission === "denied") {
        console.log("[Highlite] Notification permission denied.");
        NotificationHelper.canNotify = false;
    } else {
        console.log("[Highlite] Notification permission dismissed.");
        NotificationHelper.canNotify = false;
    }
}
}