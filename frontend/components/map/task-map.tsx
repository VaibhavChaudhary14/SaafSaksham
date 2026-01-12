"use client";

import * as React from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from 'next-themes';

const INITIAL_VIEW_STATE = {
    longitude: 77.1025, // Delhi
    latitude: 28.7041,
    zoom: 11
};

export default function TaskMap() {
    const { theme } = useTheme();

    // Use a free style or a placeholder. 
    // Carto Voyager is a good free option for light mode, Dark Matter for dark.
    const mapStyle = theme === 'dark'
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

    return (
        <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-border">
            <Map
                initialViewState={INITIAL_VIEW_STATE}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
                attributionControl={true}
            >
                <NavigationControl position="top-right" />

                {/* Placeholder Marker */}
                <Marker longitude={77.1025} latitude={28.7041} color="red" />

            </Map>
        </div>
    );
}
