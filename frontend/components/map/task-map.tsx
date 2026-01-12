"use client";

import * as React from 'react';
import Map, { NavigationControl, GeolocateControl, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from 'next-themes';
import { useGeolocation } from '@/hooks/use-geolocation';

const INITIAL_VIEW_STATE = {
    longitude: 77.1025, // Delhi
    latitude: 28.7041,
    zoom: 11
};

interface TaskMapProps {
    className?: string;
}

export function TaskMap({ className }: TaskMapProps) {
    const { theme } = useTheme();
    const { location, loading, error } = useGeolocation();
    const mapRef = React.useRef<any>(null);
    const [hasCentered, setHasCentered] = React.useState(false);

    // Use a free style or a placeholder. 
    // Carto Voyager is a good free option for light mode, Dark Matter for dark.
    const mapStyle = theme === 'dark'
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

    // Effect to fly to user location once found
    React.useEffect(() => {
        if (location && mapRef.current && !hasCentered) {
            mapRef.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 14,
                essential: true
            });
            setHasCentered(true);
        }
    }, [location, hasCentered]);

    const handleRecenter = () => {
        if (location && mapRef.current) {
            mapRef.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 14,
                essential: true
            });
        }
    };

    return (
        <div className={`relative border-2 border-black shadow-neo overflow-hidden ${className || 'w-full h-[600px]'}`}>
            <Map
                ref={mapRef}
                initialViewState={INITIAL_VIEW_STATE}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
            >
                <NavigationControl position="top-right" />

                <GeolocateControl
                    position="top-right"
                    trackUserLocation={true}
                    onGeolocate={(e) => {
                        // Update internal state if the control finds location
                        console.log("Geolocate successful", e);
                    }}
                />

                {/* User Location Marker */}
                {location && (
                    <Marker longitude={location.longitude} latitude={location.latitude} color="blue">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping" />
                            <div className="relative h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                        </div>
                    </Marker>
                )}
            </Map>

            {loading && !location && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-3 py-1 border-2 border-black shadow-sm font-mono text-xs animate-pulse">
                    DETECTING LOCATION...
                </div>
            )}

            {error && (
                <div className="absolute top-4 left-4 bg-red-100 text-red-500 text-xs p-2 font-bold border-2 border-red-500 shadow-sm">
                    ⚠️ {error}
                </div>
            )}

            {location && (
                <button
                    onClick={handleRecenter}
                    className="absolute bottom-8 right-2 bg-neo-lemon border-2 border-black p-2 shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-bold text-xs z-10"
                >
                    RECENTER
                </button>
            )}
        </div>
    );
}
