// /utils/location.js

// Convert coordinates → City name
export async function getCityName(lat, lng) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )
    const data = await res.json()

    if (data.results?.length > 0) {
      const components = data.results[0].address_components
      const cityObj = components.find((c) => c.types.includes('locality'))
      return cityObj ? cityObj.long_name : 'Unknown'
    }
  } catch (err) {
    console.error('Error fetching city name:', err)
  }
  return 'Unknown'
}

// Calculate distance between two coordinates (Haversine formula)
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Find closest restaurant
export function findClosestRestaurant(userLat, userLng, restaurants) {
  return restaurants.reduce((closest, r) => {
    const dist = getDistance(userLat, userLng, r.lat, r.lng)
    if (!closest || dist < closest.dist) return { ...r, dist }
    return closest
  }, null)
}
