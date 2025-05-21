export abstract class Manager {
    private static instance: Manager;
    abstract name: string;

    constructor() {
        if (Manager.instance) {
            return Manager.instance;
        }
        Manager.instance = this;
        this.addToNamespace();
    }

    addToNamespace() {
        if (document.highlite.manager[this.name]) {
            // Delete the old instance
            console.debug(`[Highlite] Deleting old instance of ${this.name}`);
            delete document.highlite.manager[this.name];
        }
        document.highlite.manager[this.name] = this;
    }
}