import { useState, useEffect } from "react";

const STORAGE_KEY = "geolash-map-style";
type MapStyle = "satellite" | "terrain";

export function useMapSettings() {
    const [activeLayer, setActiveLayer] = useState<MapStyle>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return (saved === "satellite" || saved === "terrain") ? saved : "satellite";
    });

    const setLayer = (style: MapStyle) => {
        setActiveLayer(style);
        localStorage.setItem(STORAGE_KEY, style);
    };

    return {
        activeLayer,
        setLayer,
    };
}
