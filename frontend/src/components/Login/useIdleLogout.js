import { useEffect, useRef } from "react";

// const IDLE_TIME = 30 * 1000;
const IDLE_TIME = 10 * 60 * 1000; // 10 minutes

const useIdleLogout = (handleLogout) => {
    const timerRef = useRef(null);
    const logoutRef = useRef(handleLogout);

    useEffect(() => {
        logoutRef.current = handleLogout;
    }, [handleLogout]);

    useEffect(() => {
        console.log("🔥 Idle logout initialized");

        const resetTimer = () => {
            console.log("🔄 Activity detected - timer reset");

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                console.log("⏰ 30 seconds idle - logging out");

                logoutRef.current();
            }, IDLE_TIME);
        };

        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            console.log("🧹 Cleaning idle logout");

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, []);
};

export default useIdleLogout;