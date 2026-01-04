type Listener = () => void;

class AuthEventBus {
    private logoutListeners: Listener[] = [];
    private loginListeners: Listener[] = [];

    /* ================= 로그아웃 ================= */
    subscribeLogout(listener: Listener) {
        this.logoutListeners.push(listener);
        return () => {
            this.logoutListeners =
                this.logoutListeners.filter(l => l !== listener);
        };
    }

    emitLogout() {
        this.logoutListeners.forEach(l => l());
    }

    /* ================= 로그인 ================= */
    subscribeLogin(listener: Listener) {
        this.loginListeners.push(listener);
        return () => {
            this.loginListeners =
                this.loginListeners.filter(l => l !== listener);
        };
    }

    emitLogin() {
        this.loginListeners.forEach(l => l());
    }
}

export const authEventBus = new AuthEventBus();
