import { useEffect, useState } from "react";

export function useResponsivePageSize(mobileSize: number, desktopSize: number) {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 639px)").matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 639px)");
        const update = () => setIsMobile(mediaQuery.matches);
        update();
        mediaQuery.addEventListener("change", update);
        return () => mediaQuery.removeEventListener("change", update);
    }, []);

    return isMobile ? mobileSize : desktopSize;
}
