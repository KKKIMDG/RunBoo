type Listener = () => void;

class AuthEventBus {
    private listeners: Listener[] = [];

    subscribe(listener: Listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    emitLogout() {
        this.listeners.forEach(l => l());
    }
}

export const authEventBus = new AuthEventBus();
