// 거리 계산 유틸리티 함수들

// Haversine 공식을 사용하여 두 좌표 간의 거리 계산 (km 단위)
export function calculateDistanceBetweenCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 우편번호를 좌표로 변환하는 함수 (실제로는 Geocoding API 사용)
export async function getCoordinatesFromPostalCode(postalCode: string): Promise<{lat: number, lng: number} | null> {
  // 토론토 지역 주요 우편번호들의 실제 좌표
  const postalCodeCoordinates: Record<string, {lat: number, lng: number}> = {
    'M5V 3A8': { lat: 43.6426, lng: -79.3871 }, // Entertainment District
    'M4C 1B5': { lat: 43.6769, lng: -79.3505 }, // Danforth
    'M2N 6K1': { lat: 43.7615, lng: -79.4111 }, // North York
    'L5A 2B3': { lat: 43.5890, lng: -79.6441 }, // Mississauga
    'L6P 1A1': { lat: 43.5890, lng: -79.6441 }, // Mississauga
    'K1A 0A6': { lat: 45.4215, lng: -75.6972 }, // Ottawa
    'H3A 1B2': { lat: 45.5017, lng: -73.5673 }, // Montreal
    'V6B 3K9': { lat: 49.2827, lng: -123.1207 }, // Vancouver
    'T2P 1J9': { lat: 51.0447, lng: -114.0719 }, // Calgary
    'S7K 1A1': { lat: 52.1301, lng: -106.6470 }, // Saskatoon
    'R3T 2N2': { lat: 49.8951, lng: -97.1384 }, // Winnipeg
    'E1C 4B9': { lat: 46.5653, lng: -66.4619 }, // New Brunswick
  }

  return postalCodeCoordinates[postalCode] || null
}

// 현재 위치 가져오기 (브라우저 Geolocation API 사용)
export async function getCurrentLocation(): Promise<{lat: number, lng: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        // 위치 접근 실패 시 토론토 시청을 기본값으로 사용
        console.warn('Failed to get current location, using Toronto City Hall as default:', error.message)
        resolve({
          lat: 43.6532, // 토론토 시청 위도
          lng: -79.3832 // 토론토 시청 경도
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  })
}

// 거리를 사람이 읽기 쉬운 형태로 포맷팅
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km away`
  } else {
    return `${Math.round(distance)}km away`
  }
}

// 우편번호로부터 거리 계산 (메인 함수)
export async function calculateDistanceFromCurrentLocation(postalCode: string): Promise<string> {
  try {
    // 1. 현재 위치 가져오기
    const currentLocation = await getCurrentLocation()
    
    // 2. 우편번호를 좌표로 변환
    const projectCoordinates = await getCoordinatesFromPostalCode(postalCode)
    
    if (!projectCoordinates) {
      return '위치 정보 없음'
    }
    
    // 3. 두 좌표 간의 거리 계산
    const distance = calculateDistanceBetweenCoordinates(
      currentLocation.lat,
      currentLocation.lng,
      projectCoordinates.lat,
      projectCoordinates.lng
    )
    
    // 4. 거리 포맷팅
    return formatDistance(distance)
    
  } catch (error) {
    console.error('Error calculating distance:', error)
    return '거리 계산 불가'
  }
}
