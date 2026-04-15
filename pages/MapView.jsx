import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Custom icon for farmers
const farmerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// User location icon
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684831.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const MapView = ({ cropType = '', isDarkMode }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(50); // km
  const [selectedListing, setSelectedListing] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to India center if permission denied
          setUserLocation({ lat: 20.5937, lng: 78.9629 });
        }
      );
    }
  }, []);

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/marketplace/map/listings', {
        params: { cropType }
      });
      
      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [cropType]);

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  // Filter nearby listings
  const nearbyListings = listings.filter(listing => {
    if (!listing.location || !listing.location.lat || !listing.location.lng) return false;
    
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      listing.location.lat, listing.location.lng
    );
    return distance <= radius;
  });

  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            🌾 Find Farmers Near You
            {nearbyListings.length > 0 && ` (${nearbyListings.length} found)`}
          </h3>
          
          <div className="flex items-center gap-4">
            <select 
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
              <option value="100">Within 100 km</option>
              <option value="200">Within 200 km</option>
            </select>
            
            <button 
              onClick={fetchListings}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[500px]">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={8}
          className="h-full w-full"
        >
          {/* OpenStreetMap tiles - FREE */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User location */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
          
          {/* Search radius circle */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radius * 1000}
            pathOptions={{
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
          
          {/* Farmer markers */}
          {nearbyListings.map((listing, index) => (
            <Marker
              key={listing.id}
              position={[listing.location.lat, listing.location.lng]}
              icon={farmerIcon}
              eventHandlers={{
                click: () => setSelectedListing(listing)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h4 className="font-bold text-lg text-green-700">
                    {listing.crop} ({listing.grade})
                  </h4>
                  <p className="text-sm text-gray-600">
                    <strong>Farmer:</strong> {listing.farmer?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Price:</strong> ₹{listing.pricePerKg}/kg
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Quantity:</strong> {listing.quantityKg} kg
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {listing.location.address}
                  </p>
                  {listing.farmer?.phone && (
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {listing.farmer.phone}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      // Set this as selected crop in main marketplace
                      window.dispatchEvent(new CustomEvent('selectCrop', { 
                        detail: { cropId: listing.id } 
                      }));
                    }}
                    className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded text-sm"
                  >
                    View in Marketplace
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Selected listing details */}
      {selectedListing && (
        <div className={`p-4 ${isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedListing.crop} ({selectedListing.grade})
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedListing.location.address}, {selectedListing.location.city}
              </p>
            </div>
            <button
              onClick={() => setSelectedListing(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-bold text-green-600">₹{selectedListing.pricePerKg}/kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="font-bold">{selectedListing.quantityKg} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Farmer</p>
              <p className="font-bold">{selectedListing.farmer?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="font-bold">{selectedListing.farmer?.rating || 'N/A'}/5</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('selectCrop', { 
                detail: { cropId: selectedListing.id } 
              }));
            }}
            className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium"
          >
            Place Bid on This Crop
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default MapView;
