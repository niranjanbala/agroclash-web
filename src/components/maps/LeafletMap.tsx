'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { GeoJSON } from 'geojson'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LeafletMapProps {
    center?: [number, number]
    zoom?: number
    height?: string
    plots?: Array<{
        id: string
        name: string
        geometry: GeoJSON.Polygon
        status?: string
    }>
    onPlotCreate?: (geometry: GeoJSON.Polygon) => void
    onPlotEdit?: (plotId: string, geometry: GeoJSON.Polygon) => void
    onPlotSelect?: (plotId: string) => void
    editMode?: boolean
    selectedPlotId?: string
    className?: string
}

export function LeafletMap({
    center = [40.7128, -74.0060], // Default to NYC
    zoom = 13,
    height = '400px',
    plots = [],
    onPlotCreate,
    onPlotEdit,
    onPlotSelect,
    editMode = false,
    selectedPlotId,
    className = ''
}: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)
    const drawControlRef = useRef<L.Control.Draw | null>(null)
    const plotLayersRef = useRef<Map<string, L.Polygon>>(new Map())
    const [isMapReady, setIsMapReady] = useState(false)

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        const map = L.map(mapRef.current).setView(center, zoom)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        mapInstanceRef.current = map
        setIsMapReady(true)

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [center, zoom])

    // Setup drawing controls
    useEffect(() => {
        if (!mapInstanceRef.current || !isMapReady) return

        const map = mapInstanceRef.current

        // Create feature group for drawn items
        const drawnItems = new L.FeatureGroup()
        map.addLayer(drawnItems)

        // Setup draw control
        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: editMode ? {
                    allowIntersection: false,
                    drawError: {
                        color: '#e1e100',
                        message: '<strong>Error:</strong> Shape edges cannot cross!'
                    },
                    shapeOptions: {
                        color: '#97009c',
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.2
                    }
                } : false,
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems,
                remove: editMode
            }
        })

        if (editMode) {
            map.addControl(drawControl)
            drawControlRef.current = drawControl
        }

        // Handle draw events
        map.on(L.Draw.Event.CREATED, (event: any) => {
            const layer = event.layer
            const type = event.layerType

            if (type === 'polygon' && onPlotCreate) {
                const latLngs = layer.getLatLngs()[0]
                const coordinates = latLngs.map((latLng: L.LatLng) => [latLng.lng, latLng.lat])
                coordinates.push(coordinates[0]) // Close the polygon

                const geometry: GeoJSON.Polygon = {
                    type: 'Polygon',
                    coordinates: [coordinates]
                }

                onPlotCreate(geometry)
            }

            drawnItems.addLayer(layer)
        })

        map.on(L.Draw.Event.EDITED, (event: any) => {
            const layers = event.layers
            layers.eachLayer((layer: L.Polygon) => {
                // Find which plot this layer belongs to
                for (const [plotId, plotLayer] of plotLayersRef.current.entries()) {
                    if (plotLayer === layer && onPlotEdit) {
                        const latLngs = layer.getLatLngs()[0] as L.LatLng[]
                        const coordinates = latLngs.map((latLng: L.LatLng) => [latLng.lng, latLng.lat])
                        coordinates.push(coordinates[0]) // Close the polygon

                        const geometry: GeoJSON.Polygon = {
                            type: 'Polygon',
                            coordinates: [coordinates]
                        }

                        onPlotEdit(plotId, geometry)
                        break
                    }
                }
            })
        })

        return () => {
            if (drawControlRef.current && map) {
                map.removeControl(drawControlRef.current)
                drawControlRef.current = null
            }
            map.off(L.Draw.Event.CREATED)
            map.off(L.Draw.Event.EDITED)
        }
    }, [isMapReady, editMode, onPlotCreate, onPlotEdit])

    // Render plots
    useEffect(() => {
        if (!mapInstanceRef.current || !isMapReady) return

        const map = mapInstanceRef.current

        // Clear existing plot layers
        plotLayersRef.current.forEach(layer => {
            map.removeLayer(layer)
        })
        plotLayersRef.current.clear()

        // Add plot layers
        plots.forEach(plot => {
            try {
                const coordinates = plot.geometry.coordinates[0]
                const latLngs = coordinates.map(coord => [coord[1], coord[0]] as [number, number])

                const color = getPlotColor(plot.status)
                const isSelected = plot.id === selectedPlotId

                const polygon = L.polygon(latLngs, {
                    color: isSelected ? '#ff6b6b' : color,
                    weight: isSelected ? 3 : 2,
                    opacity: 0.8,
                    fillOpacity: isSelected ? 0.4 : 0.2,
                    fillColor: color
                })

                polygon.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-lg">${plot.name}</h3>
            <p class="text-sm text-gray-600">Status: ${plot.status || 'Active'}</p>
            <p class="text-sm text-gray-600">Area: ${calculatePolygonArea(coordinates).toFixed(2)} ha</p>
          </div>
        `)

                polygon.on('click', () => {
                    if (onPlotSelect) {
                        onPlotSelect(plot.id)
                    }
                })

                polygon.addTo(map)
                plotLayersRef.current.set(plot.id, polygon)
            } catch (error) {
                console.error('Error rendering plot:', plot.id, error)
            }
        })
    }, [plots, selectedPlotId, onPlotSelect, isMapReady])

    // Update map center when center prop changes
    useEffect(() => {
        if (mapInstanceRef.current && isMapReady) {
            mapInstanceRef.current.setView(center, zoom)
        }
    }, [center, zoom, isMapReady])

    const getPlotColor = (status?: string): string => {
        switch (status) {
            case 'active':
                return '#10b981' // green
            case 'inactive':
                return '#6b7280' // gray
            case 'planning':
                return '#3b82f6' // blue
            case 'harvesting':
                return '#f59e0b' // yellow
            default:
                return '#10b981' // default green
        }
    }

    const calculatePolygonArea = (coordinates: number[][]): number => {
        let area = 0
        const n = coordinates.length

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n
            area += coordinates[i][0] * coordinates[j][1]
            area -= coordinates[j][0] * coordinates[i][1]
        }

        return Math.abs(area) / 2 / 10000 // Convert to hectares
    }

    return (
        <div className={`relative ${className}`}>
            <div
                ref={mapRef}
                style={{ height }}
                className="w-full rounded-lg border border-gray-300 z-0"
            />

            {editMode && (
                <div className="absolute top-2 left-2 bg-white rounded-lg shadow-md p-2 z-10">
                    <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">Drawing Mode</p>
                        <p>• Click the polygon tool to start drawing</p>
                        <p>• Click points to create your plot boundary</p>
                        <p>• Double-click to finish drawing</p>
                    </div>
                </div>
            )}

            {plots.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-white rounded-lg shadow-md p-2 z-10">
                    <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">Legend</p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Active</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                                <span>Inactive</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span>Harvesting</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}