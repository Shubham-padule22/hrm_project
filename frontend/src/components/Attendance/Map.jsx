import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "overlapping-marker-spiderfier-leaflet/dist/oms";

const Map = ({ data }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const omsRef = useRef(null);

    // Used to ignore the click that causes spiderfying
    const ignorePopupClickRef = useRef(false);

    // Initialize map
    useEffect(() => {
        const map = L.map(mapRef.current, {
            zoomControl: false,
        }).setView(
            [54.59697322074422, -5.930111466638566],
            12
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19,
            }
        ).addTo(map);

        // Zoom control on top-right
        L.control
            .zoom({
                position: "topright",
            })
            .addTo(map);

        mapInstanceRef.current = map;

        // Initialize Spiderfier
        const OverlappingMarkerSpiderfier =
            window.OverlappingMarkerSpiderfier;

        if (!OverlappingMarkerSpiderfier) {
            console.error(
                "OverlappingMarkerSpiderfier is not available"
            );
            return;
        }

        const oms = new OverlappingMarkerSpiderfier(map, {
            nearbyDistance: 20,
            keepSpiderfied: true,
        });

        omsRef.current = oms;

        /*
         * IMPORTANT
         *
         * When OMS spiderfies markers, the click that caused
         * the spiderfy should NOT open a popup.
         */
        oms.addListener("spiderfy", function () {
            ignorePopupClickRef.current = true;

            // Allow popup clicks again after the current click
            setTimeout(() => {
                ignorePopupClickRef.current = false;
            }, 300);
        });

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            omsRef.current = null;
        };
    }, []);

    // Add attendance markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        const oms = omsRef.current;

        if (!map || !oms || !Array.isArray(data)) {
            return;
        }

        // Remove old markers
        markersRef.current.forEach((marker) => {
            oms.removeMarker(marker);

            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });

        markersRef.current = [];

        // Keep only valid coordinates
        const validData = data.filter(
            (item) =>
                item.latitude != null &&
                item.longitude != null &&
                !isNaN(Number(item.latitude)) &&
                !isNaN(Number(item.longitude))
        );

        if (validData.length === 0) {
            return;
        }

        const bounds = [];

        validData.forEach((item) => {
            const latitude = Number(item.latitude);
            const longitude = Number(item.longitude);

            // Marker color
            let markerColor = "#6366f1";
            let markerText = "P";

            if (item.type === "CLOCK IN") {
                markerColor = "#ef4444";
                markerText = "IN";
            } else if (item.type === "CLOCK OUT") {
                markerColor = "#20b486";
                markerText = "OUT";
            }

            // Marker icon
            const icon = L.divIcon({
                className: "",
                html: `
                    <div style="
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        background: ${markerColor};
                        border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 10px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        ${markerText}
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            // Create marker
            const marker = L.marker(
                [latitude, longitude],
                {
                    icon,
                }
            );

            // Store popup content on marker
            marker.attendancePopup = `
                <div style="min-width: 150px;">
                    <strong>${item.type || "PUNCH"}</strong>
                    <br />
                    Time: ${item.time || "-"}
                    <br />
                    Latitude: ${latitude}
                    <br />
                    Longitude: ${longitude}
                </div>
            `;

            /*
             * DO NOT use marker.bindPopup()
             *
             * This is important because bindPopup attaches
             * Leaflet's normal click handler.
             */

            // Add marker to map
            marker.addTo(map);

            // Add marker to OMS
            oms.addMarker(marker);

            /*
             * Handle individual marker click.
             *
             * We use a normal click listener only for opening
             * the popup manually.
             */
            marker.on("click", function (e) {
                L.DomEvent.stopPropagation(e);

                /*
                 * If this click caused the spiderfy,
                 * don't open popup.
                 */
                if (ignorePopupClickRef.current) {
                    return;
                }

                /*
                 * Open popup manually.
                 */
                L.popup({
                    closeButton: true,
                    autoClose: true,
                    closeOnClick: true,
                })
                    .setLatLng(marker.getLatLng())
                    .setContent(marker.attendancePopup)
                    .openOn(map);
            });

            markersRef.current.push(marker);

            bounds.push([latitude, longitude]);
        });

        // Fit map
        if (bounds.length === 1) {
            map.setView(bounds[0], 15);
        } else {
            map.fitBounds(bounds, {
                padding: [50, 50],
            });
        }
    }, [data]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "100%",
            }}
        />
    );
};

export default Map;