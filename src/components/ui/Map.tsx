'use client'

import { useEffect, useRef, useState } from 'react'

interface MapProps {
  className?: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  zoom?: number
  height?: string
}

export default function Map({ 
  className = '', 
  address = 'NAMLA GmbH, Zeitblomstr. 31/2, 89073 Ulm',
  coordinates = { lat: 48.40385689264704, lng: 9.991081889985397 }, // NAMLA office coordinates
  zoom = 15,
  height = '300px'
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const isInitializingRef = useRef(false)
  const [mapKey] = useState(() => Math.random().toString(36).substring(7))

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || isInitializingRef.current) return
    
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      if (isInitializingRef.current) return
      isInitializingRef.current = true
      
      try {
        const L = (await import('leaflet')).default

        // Check if map is already initialized and clean it up
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Ensure the container exists and is clean
        if (!mapRef.current) {
          isInitializingRef.current = false
          return
        }

        // Clear any existing map data
        mapRef.current.innerHTML = ''
        mapRef.current._leaflet_id = null

        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Create map
        const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], zoom)

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Custom marker icon with NAMLA branding
      const customIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-8 h-8 bg-amber-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-amber-600"></div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      })

      // Add marker with popup
      const marker = L.marker([coordinates.lat, coordinates.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-center font-medium text-stone-800">
            <div class="font-bold text-amber-600 mb-1">NAMLA GmbH</div>
            <div class="text-sm text-stone-600">
              Zeitblomstr. 31/2<br>
              89073 Ulm
            </div>
            <div class="mt-2 pt-2 border-t border-stone-200">
              <a href="mailto:info@namla.de" class="text-xs text-amber-600 hover:text-amber-700">
                info@namla.de
              </a>
            </div>
          </div>
        `)
        .openPopup()

      // Add zoom control styling
      const zoomControl = map.zoomControl
      if (zoomControl) {
        zoomControl.remove()
        L.control.zoom({
          position: 'topright'
        }).addTo(map)
      }

        mapInstanceRef.current = map

        // Disable scroll zoom initially
        map.scrollWheelZoom.disable()
        
        // Enable scroll zoom on click
        map.on('click', () => {
          map.scrollWheelZoom.enable()
        })
        
        // Disable scroll zoom when mouse leaves
        map.on('mouseout', () => {
          map.scrollWheelZoom.disable()
        })
      } catch (error) {
        console.error('Failed to initialize map:', error)
      } finally {
        isInitializingRef.current = false
      }
    }

    initMap()

    // Cleanup function
    return () => {
      isInitializingRef.current = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.warn('Error cleaning up map:', error)
        }
        mapInstanceRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
        mapRef.current._leaflet_id = null
      }
    }
  }, [coordinates.lat, coordinates.lng, zoom])

  return (
    <>
      {/* Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      
      <div className={`relative ${className}`}>
        <div 
          ref={mapRef} 
          key={`map-${mapKey}`}
          style={{ height }}
          className="w-full rounded-lg shadow-sm border border-stone-200 relative z-0"
        />
        
        {/* Map overlay info */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm z-10">
          <div className="text-xs font-medium text-stone-800">NAMLA GmbH</div>
          <div className="text-xs text-stone-600">Ulm, Deutschland</div>
        </div>
        
        {/* Click to enable scroll hint */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity z-10">
          Klicken zum Zoomen
        </div>
      </div>
    </>
  )
}