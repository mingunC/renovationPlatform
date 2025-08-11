'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LocationStepProps {
  postalCode: string
  address: string
  city: string
  onUpdate: (data: { postal_code: string; address: string; city: string }) => void
}

// Canadian postal code validation
const validateCanadianPostalCode = (postalCode: string): boolean => {
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return canadianPostalRegex.test(postalCode)
}

// Canadian postal code to city mapping based on first letter (province) and first 3 characters
const getCityFromPostalCode = (postalCode: string): string => {
  const prefix = postalCode.substring(0, 3).toUpperCase()
  const firstLetter = postalCode.charAt(0).toUpperCase()
  
  // First determine province by first letter
  const provinceMapping: Record<string, string> = {
    'A': 'Newfoundland and Labrador',
    'B': 'Nova Scotia',
    'C': 'Prince Edward Island', 
    'E': 'New Brunswick',
    'G': 'Quebec (Eastern)',
    'H': 'Quebec (Montreal)',
    'J': 'Quebec (Western)',
    'K': 'Ontario (Eastern)',
    'L': 'Ontario (Central)',
    'M': 'Ontario (Toronto)',
    'N': 'Ontario (Southwestern)',
    'P': 'Ontario (Northern)',
    'R': 'Manitoba',
    'S': 'Saskatchewan',
    'T': 'Alberta',
    'V': 'British Columbia',
    'X': 'Northwest Territories & Nunavut',
    'Y': 'Yukon'
  }
  
  // More comprehensive city mapping for GTA and common areas
  const cityMapping: Record<string, string> = {
    // Test postal code
    'A0A': 'Test City',
    
    // Toronto (M postal codes)
    'M1A': 'Toronto (Scarborough)', 'M1B': 'Toronto (Scarborough)', 'M1C': 'Toronto (Scarborough)', 
    'M1E': 'Toronto (Scarborough)', 'M1G': 'Toronto (Scarborough)', 'M1H': 'Toronto (Scarborough)', 
    'M1J': 'Toronto (Scarborough)', 'M1K': 'Toronto (Scarborough)', 'M1L': 'Toronto (Scarborough)', 
    'M1M': 'Toronto (Scarborough)', 'M1N': 'Toronto (Scarborough)', 'M1P': 'Toronto (Scarborough)',
    'M1R': 'Toronto (Scarborough)', 'M1S': 'Toronto (Scarborough)', 'M1T': 'Toronto (Scarborough)', 
    'M1V': 'Toronto (Scarborough)', 'M1W': 'Toronto (Scarborough)', 'M1X': 'Toronto (Scarborough)',
    
    'M2H': 'Toronto (North York)', 'M2J': 'Toronto (North York)', 'M2K': 'Toronto (North York)', 
    'M2L': 'Toronto (North York)', 'M2M': 'Toronto (North York)', 'M2N': 'Toronto (North York)', 
    'M2P': 'Toronto (North York)', 'M2R': 'Toronto (North York)',
    
    'M3A': 'Toronto (North York)', 'M3B': 'Toronto (North York)', 'M3C': 'Toronto (North York)', 
    'M3H': 'Toronto (North York)', 'M3J': 'Toronto (North York)', 'M3K': 'Toronto (North York)', 
    'M3L': 'Toronto (North York)', 'M3M': 'Toronto (North York)', 'M3N': 'Toronto (North York)',
    
    'M4A': 'Toronto (East York)', 'M4B': 'Toronto (East York)', 'M4C': 'Toronto (East York)', 
    'M4E': 'Toronto (East Toronto)', 'M4G': 'Toronto (East Toronto)', 'M4H': 'Toronto (East Toronto)', 
    'M4J': 'Toronto (East Toronto)', 'M4K': 'Toronto (East Toronto)', 'M4L': 'Toronto (East Toronto)', 
    'M4M': 'Toronto (East Toronto)', 'M4N': 'Toronto (Central)', 'M4P': 'Toronto (Central)', 
    'M4R': 'Toronto (Central)', 'M4S': 'Toronto (Central)', 'M4T': 'Toronto (Central)', 
    'M4V': 'Toronto (Central)', 'M4W': 'Toronto (Central)', 'M4X': 'Toronto (Central)', 
    'M4Y': 'Toronto (Central)',
    
    'M5A': 'Toronto (Downtown)', 'M5B': 'Toronto (Downtown)', 'M5C': 'Toronto (Downtown)', 
    'M5E': 'Toronto (Downtown)', 'M5G': 'Toronto (Downtown)', 'M5H': 'Toronto (Downtown)', 
    'M5J': 'Toronto (Downtown)', 'M5K': 'Toronto (Downtown)', 'M5L': 'Toronto (Downtown)', 
    'M5M': 'Toronto (North York)', 'M5N': 'Toronto (Central)', 'M5P': 'Toronto (Central)', 
    'M5R': 'Toronto (Central)', 'M5S': 'Toronto (Central)', 'M5T': 'Toronto (Downtown)', 
    'M5V': 'Toronto (Downtown)', 'M5W': 'Toronto (Downtown)', 'M5X': 'Toronto (Downtown)',
    
    'M6A': 'Toronto (North York)', 'M6B': 'Toronto (North York)', 'M6C': 'Toronto (York)', 
    'M6E': 'Toronto (York)', 'M6G': 'Toronto (West Toronto)', 'M6H': 'Toronto (West Toronto)', 
    'M6J': 'Toronto (West Toronto)', 'M6K': 'Toronto (West Toronto)', 'M6L': 'Toronto (North York)', 
    'M6M': 'Toronto (Etobicoke)', 'M6N': 'Toronto (York)', 'M6P': 'Toronto (West Toronto)', 
    'M6R': 'Toronto (West Toronto)', 'M6S': 'Toronto (Etobicoke)',
    
    'M7A': 'Toronto (Downtown)', 'M8V': 'Toronto (Etobicoke)', 'M8W': 'Toronto (Etobicoke)', 
    'M8X': 'Toronto (Etobicoke)', 'M8Y': 'Toronto (Etobicoke)', 'M8Z': 'Toronto (Etobicoke)',
    'M9A': 'Toronto (Etobicoke)', 'M9B': 'Toronto (Etobicoke)', 'M9C': 'Toronto (Etobicoke)', 
    'M9L': 'Toronto (North York)', 'M9M': 'Toronto (North York)', 'M9N': 'Toronto (York)', 
    'M9P': 'Toronto (Etobicoke)', 'M9R': 'Toronto (Etobicoke)', 'M9V': 'Toronto (Etobicoke)', 
    'M9W': 'Toronto (Etobicoke)',
    
    // Mississauga
    'L4T': 'Mississauga', 'L4V': 'Mississauga', 'L4W': 'Mississauga', 'L4X': 'Mississauga', 
    'L4Y': 'Mississauga', 'L4Z': 'Mississauga', 'L5A': 'Mississauga', 'L5B': 'Mississauga', 
    'L5C': 'Mississauga', 'L5E': 'Mississauga', 'L5G': 'Mississauga', 'L5H': 'Mississauga', 
    'L5J': 'Mississauga', 'L5K': 'Mississauga', 'L5L': 'Mississauga', 'L5M': 'Mississauga', 
    'L5N': 'Mississauga', 'L5P': 'Mississauga', 'L5R': 'Mississauga', 'L5S': 'Mississauga', 
    'L5T': 'Mississauga', 'L5V': 'Mississauga', 'L5W': 'Mississauga',
    
    // Brampton  
    'L6P': 'Brampton', 'L6R': 'Brampton', 'L6S': 'Brampton', 'L6T': 'Brampton', 
    'L6V': 'Brampton', 'L6W': 'Brampton', 'L6X': 'Brampton', 'L6Y': 'Brampton', 
    'L6Z': 'Brampton', 'L7A': 'Brampton', 'L7B': 'Brampton',
    
    // Markham & Richmond Hill
    'L3P': 'Markham', 'L3R': 'Markham', 'L3S': 'Markham', 'L3T': 'Markham', 
    'L6B': 'Markham', 'L6C': 'Markham', 'L6E': 'Markham', 'L6G': 'Markham', 
    'L6H': 'Markham', 'L6J': 'Markham', 'L6K': 'Markham', 'L4B': 'Richmond Hill',
    'L4C': 'Richmond Hill', 'L4E': 'Richmond Hill', 'L4S': 'Richmond Hill',
    
    // Vaughan
    'L4H': 'Vaughan', 'L4J': 'Vaughan', 'L4K': 'Vaughan', 'L4L': 'Vaughan', 'L6A': 'Vaughan',
    
    // Other GTA cities
    'L0A': 'Ajax', 'L1S': 'Ajax', 'L1T': 'Ajax', 'L1Z': 'Ajax',
    'L1V': 'Pickering', 'L1W': 'Pickering', 'L1X': 'Pickering', 'L1Y': 'Pickering',
    'L0H': 'Whitby', 'L1M': 'Whitby', 'L1N': 'Whitby', 'L1P': 'Whitby', 'L1R': 'Whitby',
    'L1C': 'Oshawa', 'L1G': 'Oshawa', 'L1H': 'Oshawa', 'L1J': 'Oshawa', 'L1K': 'Oshawa', 'L1L': 'Oshawa',
    
    // Hamilton
    'L8E': 'Hamilton', 'L8G': 'Hamilton', 'L8H': 'Hamilton', 'L8J': 'Hamilton', 'L8K': 'Hamilton', 
    'L8L': 'Hamilton', 'L8M': 'Hamilton', 'L8N': 'Hamilton', 'L8P': 'Hamilton', 'L8R': 'Hamilton', 
    'L8S': 'Hamilton', 'L8T': 'Hamilton', 'L8V': 'Hamilton', 'L8W': 'Hamilton', 'L9A': 'Hamilton', 
    'L9B': 'Hamilton', 'L9C': 'Hamilton', 'L9G': 'Hamilton', 'L9H': 'Hamilton', 'L9K': 'Hamilton',
    
    // Ottawa (K postal codes)
    'K1A': 'Ottawa', 'K1B': 'Ottawa', 'K1C': 'Ottawa', 'K1E': 'Ottawa', 'K1G': 'Ottawa', 
    'K1H': 'Ottawa', 'K1J': 'Ottawa', 'K1K': 'Ottawa', 'K1L': 'Ottawa', 'K1M': 'Ottawa', 
    'K1N': 'Ottawa', 'K1P': 'Ottawa', 'K1R': 'Ottawa', 'K1S': 'Ottawa', 'K1T': 'Ottawa', 
    'K1V': 'Ottawa', 'K1W': 'Ottawa', 'K1X': 'Ottawa', 'K1Y': 'Ottawa', 'K1Z': 'Ottawa',
    'K2A': 'Ottawa', 'K2B': 'Ottawa', 'K2C': 'Ottawa', 'K2E': 'Ottawa', 'K2G': 'Ottawa', 
    'K2H': 'Ottawa', 'K2J': 'Ottawa', 'K2K': 'Ottawa', 'K2L': 'Ottawa', 'K2M': 'Ottawa', 
    'K2P': 'Ottawa', 'K2R': 'Ottawa', 'K2S': 'Ottawa', 'K2T': 'Ottawa', 'K2V': 'Ottawa', 
    'K2W': 'Ottawa',
    
    // Vancouver (V postal codes)
    'V5A': 'Vancouver', 'V5B': 'Vancouver', 'V5C': 'Vancouver', 'V5E': 'Vancouver', 
    'V5G': 'Vancouver', 'V5H': 'Vancouver', 'V5J': 'Vancouver', 'V5K': 'Vancouver', 
    'V5L': 'Vancouver', 'V5M': 'Vancouver', 'V5N': 'Vancouver', 'V5P': 'Vancouver', 
    'V5R': 'Vancouver', 'V5S': 'Vancouver', 'V5T': 'Vancouver', 'V5V': 'Vancouver', 
    'V5W': 'Vancouver', 'V5X': 'Vancouver', 'V5Y': 'Vancouver', 'V5Z': 'Vancouver',
    'V6A': 'Vancouver', 'V6B': 'Vancouver', 'V6C': 'Vancouver', 'V6E': 'Vancouver', 
    'V6G': 'Vancouver', 'V6H': 'Vancouver', 'V6J': 'Vancouver', 'V6K': 'Vancouver', 
    'V6L': 'Vancouver', 'V6M': 'Vancouver', 'V6N': 'Vancouver', 'V6P': 'Vancouver', 
    'V6R': 'Vancouver', 'V6S': 'Vancouver', 'V6T': 'Vancouver', 'V6V': 'Vancouver', 
    'V6W': 'Vancouver', 'V6X': 'Vancouver', 'V6Y': 'Vancouver', 'V6Z': 'Vancouver',
    
    // Montreal (H postal codes)
    'H1A': 'Montreal', 'H1B': 'Montreal', 'H1C': 'Montreal', 'H1E': 'Montreal', 
    'H1G': 'Montreal', 'H1H': 'Montreal', 'H1J': 'Montreal', 'H1K': 'Montreal', 
    'H1L': 'Montreal', 'H1M': 'Montreal', 'H1N': 'Montreal', 'H1P': 'Montreal', 
    'H1R': 'Montreal', 'H1S': 'Montreal', 'H1T': 'Montreal', 'H1V': 'Montreal', 
    'H1W': 'Montreal', 'H1X': 'Montreal', 'H1Y': 'Montreal', 'H1Z': 'Montreal',
    'H2A': 'Montreal', 'H2B': 'Montreal', 'H2C': 'Montreal', 'H2E': 'Montreal', 
    'H2G': 'Montreal', 'H2H': 'Montreal', 'H2J': 'Montreal', 'H2K': 'Montreal', 
    'H2L': 'Montreal', 'H2M': 'Montreal', 'H2N': 'Montreal', 'H2P': 'Montreal', 
    'H2R': 'Montreal', 'H2S': 'Montreal', 'H2T': 'Montreal', 'H2V': 'Montreal', 
    'H2W': 'Montreal', 'H2X': 'Montreal', 'H2Y': 'Montreal', 'H2Z': 'Montreal',
    'H3A': 'Montreal', 'H3B': 'Montreal', 'H3C': 'Montreal', 'H3E': 'Montreal', 
    'H3G': 'Montreal', 'H3H': 'Montreal', 'H3J': 'Montreal', 'H3K': 'Montreal', 
    'H3L': 'Montreal', 'H3M': 'Montreal', 'H3N': 'Montreal', 'H3P': 'Montreal', 
    'H3R': 'Montreal', 'H3S': 'Montreal', 'H3T': 'Montreal', 'H3V': 'Montreal', 
    'H3W': 'Montreal', 'H3X': 'Montreal', 'H3Y': 'Montreal', 'H3Z': 'Montreal',
    'H4A': 'Montreal', 'H4B': 'Montreal', 'H4C': 'Montreal', 'H4E': 'Montreal', 
    'H4G': 'Montreal', 'H4H': 'Montreal', 'H4J': 'Montreal', 'H4K': 'Montreal', 
    'H4L': 'Montreal', 'H4M': 'Montreal', 'H4N': 'Montreal', 'H4P': 'Montreal', 
    'H4R': 'Montreal', 'H4S': 'Montreal', 'H4T': 'Montreal', 'H4V': 'Montreal', 
    'H4W': 'Montreal', 'H4X': 'Montreal', 'H4Y': 'Montreal', 'H4Z': 'Montreal',
    
    // Calgary (T postal codes)
    'T1X': 'Calgary', 'T1Y': 'Calgary', 'T2A': 'Calgary', 'T2B': 'Calgary', 'T2C': 'Calgary', 
    'T2E': 'Calgary', 'T2G': 'Calgary', 'T2H': 'Calgary', 'T2J': 'Calgary', 'T2K': 'Calgary', 
    'T2L': 'Calgary', 'T2M': 'Calgary', 'T2N': 'Calgary', 'T2P': 'Calgary', 'T2R': 'Calgary', 
    'T2S': 'Calgary', 'T2T': 'Calgary', 'T2V': 'Calgary', 'T2W': 'Calgary', 'T2X': 'Calgary', 
    'T2Y': 'Calgary', 'T2Z': 'Calgary', 'T3A': 'Calgary', 'T3B': 'Calgary', 'T3C': 'Calgary', 
    'T3E': 'Calgary', 'T3G': 'Calgary', 'T3H': 'Calgary', 'T3J': 'Calgary', 'T3K': 'Calgary', 
    'T3L': 'Calgary', 'T3M': 'Calgary', 'T3N': 'Calgary', 'T3P': 'Calgary', 'T3R': 'Calgary', 
    'T3Z': 'Calgary'
  }
  
  // First try specific city mapping
  if (cityMapping[prefix]) {
    return cityMapping[prefix]
  }
  
  // Fall back to province if specific city not found
  const province = provinceMapping[firstLetter]
  if (province) {
    return `Unknown City, ${province}`
  }
  
  return ''
}

export function LocationStep({ postalCode, address, city, onUpdate }: LocationStepProps) {
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)

  const handlePostalCodeChange = (value: string) => {
    // Remove spaces and non-alphanumeric characters, then convert to uppercase
    const cleanedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    
    // Limit to 6 characters (A1A1A1)
    const limitedValue = cleanedValue.substring(0, 6)
    
    // Format as A1A 1A1
    let formatted = limitedValue
    if (limitedValue.length > 3) {
      formatted = limitedValue.substring(0, 3) + ' ' + limitedValue.substring(3)
    }
    
    setPostalCodeError(null)
    
    // Check validation when we have 6 characters (complete postal code)
    if (limitedValue.length === 6) {
      if (validateCanadianPostalCode(formatted)) {
        const detectedCity = getCityFromPostalCode(formatted)
        onUpdate({ 
          postal_code: formatted, 
          address, 
          city: detectedCity || city 
        })
      } else {
        setPostalCodeError('Please enter a valid Canadian postal code (e.g., A0A 0A0)')
      }
    } else {
      onUpdate({ postal_code: formatted, address, city })
    }
  }

  const handleAddressChange = (value: string) => {
    setAddressError(null)
    
    if (value.length > 0 && value.length < 10) {
      setAddressError('Please enter a complete address')
    }
    
    onUpdate({ postal_code: postalCode, address: value, city })
  }

  const isPostalCodeValid = validateCanadianPostalCode(postalCode)
  const isAddressValid = address.length >= 10

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where is your project located?
        </h2>
        <p className="text-gray-600">
          This helps us find contractors in your area
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="postal-code" className="text-base font-medium">
              Postal Code *
            </Label>
            <Input
              id="postal-code"
              type="text"
              placeholder="A0A 0A0"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              maxLength={7}
              className={`text-lg ${postalCodeError ? 'border-red-500' : isPostalCodeValid ? 'border-green-500' : ''}`}
            />
            {postalCodeError && (
              <p className="text-sm text-red-600">{postalCodeError}</p>
            )}
            {isPostalCodeValid && (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valid postal code
              </p>
            )}
          </div>

          {city && (
            <Alert>
              <AlertDescription className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Detected city: <strong>{city}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-medium">
              Full Address *
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main Street, Unit 4B"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={`text-lg ${addressError ? 'border-red-500' : isAddressValid ? 'border-green-500' : ''}`}
            />
            {addressError && (
              <p className="text-sm text-red-600">{addressError}</p>
            )}
            {isAddressValid && (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Address looks good
              </p>
            )}
            <p className="text-sm text-gray-500">
              Include street number, street name, and unit/apartment number if applicable
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-green-800 mb-1">Privacy Protected</h4>
            <p className="text-sm text-green-700">
              The address above will be used for on-site inspections. Your phone number and email will only be shared with contractors. We use your location to find the best local professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
