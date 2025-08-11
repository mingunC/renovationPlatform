import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/hooks/use-contractor-onboarding'

interface ServiceAreasStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const GTA_AREAS = [
  {
    id: 'central',
    name: 'Central Toronto',
    areas: [
      { code: 'M4W', name: 'Toronto (Downtown)', population: '2.9M', icon: '🏙️' },
      { code: 'M2N', name: 'North York', population: '672K', icon: '🌆' },
      { code: 'M1P', name: 'Scarborough', population: '632K', icon: '🏘️' },
      { code: 'M9C', name: 'Etobicoke', population: '365K', icon: '🌳' },
    ]
  },
  {
    id: 'west',
    name: 'Western GTA',
    areas: [
      { code: 'L5B', name: 'Mississauga', population: '717K', icon: '🏢' },
      { code: 'L6V', name: 'Brampton', population: '656K', icon: '🏡' },
      { code: 'L7A', name: 'Oakville', population: '213K', icon: '🌊' },
      { code: 'L7M', name: 'Burlington', population: '186K', icon: '🏞️' },
    ]
  },
  {
    id: 'north',
    name: 'Northern GTA',
    areas: [
      { code: 'L3R', name: 'Markham', population: '328K', icon: '🎋' },
      { code: 'L4C', name: 'Richmond Hill', population: '195K', icon: '🌺' },
      { code: 'L4K', name: 'Vaughan', population: '306K', icon: '🍀' },
    ]
  }
]

export function ServiceAreasStep({ data, updateData }: ServiceAreasStepProps) {
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())

  const handleAreaToggle = (areaCode: string) => {
    const currentAreas = [...data.service_areas]
    const isSelected = currentAreas.includes(areaCode)
    
    if (isSelected) {
      updateData({
        service_areas: currentAreas.filter(code => code !== areaCode)
      })
    } else {
      updateData({
        service_areas: [...currentAreas, areaCode]
      })
    }
  }

  const handleRegionToggle = (regionId: string) => {
    const region = GTA_AREAS.find(r => r.id === regionId)
    if (!region) return

    const regionCodes = region.areas.map(area => area.code)
    const allSelected = regionCodes.every(code => data.service_areas.includes(code))
    
    if (allSelected) {
      // Deselect all in region
      updateData({
        service_areas: data.service_areas.filter(code => !regionCodes.includes(code))
      })
      setSelectedRegions(prev => {
        const newSet = new Set(prev)
        newSet.delete(regionId)
        return newSet
      })
    } else {
      // Select all in region
      const newAreas = [...new Set([...data.service_areas, ...regionCodes])]
      updateData({
        service_areas: newAreas
      })
      setSelectedRegions(prev => new Set(prev).add(regionId))
    }
  }

  const selectAllAreas = () => {
    const allCodes = GTA_AREAS.flatMap(region => region.areas.map(area => area.code))
    updateData({ service_areas: allCodes })
    setSelectedRegions(new Set(GTA_AREAS.map(r => r.id)))
  }

  const clearAllAreas = () => {
    updateData({ service_areas: [] })
    setSelectedRegions(new Set())
  }

  const getRegionStats = (regionId: string) => {
    const region = GTA_AREAS.find(r => r.id === regionId)
    if (!region) return { selected: 0, total: 0 }
    
    const selected = region.areas.filter(area => data.service_areas.includes(area.code)).length
    return { selected, total: region.areas.length }
  }

  const getTotalPopulation = () => {
    return GTA_AREAS
      .flatMap(region => region.areas)
      .filter(area => data.service_areas.includes(area.code))
      .reduce((total, area) => {
        const pop = parseFloat(area.population.replace(/[KM]/g, ''))
        const multiplier = area.population.includes('M') ? 1000000 : 1000
        return total + (pop * multiplier)
      }, 0)
  }

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`
    }
    return `${(pop / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where do you provide services? 📍
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the areas where you&apos;re willing to take on renovation projects. 
          You can always update this later as your business grows.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={selectAllAreas}>
            Select All Areas
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllAreas}>
            Clear Selection
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {data.service_areas.length} areas selected
          {data.service_areas.length > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              • {formatPopulation(getTotalPopulation())} potential customers
            </span>
          )}
        </div>
      </div>

      {/* Service Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {GTA_AREAS.map((region) => {
          const stats = getRegionStats(region.id)
          const isFullySelected = stats.selected === stats.total
          const isPartiallySelected = stats.selected > 0 && stats.selected < stats.total
          
          return (
            <Card key={region.id} className={`
              transition-all duration-200 
              ${isFullySelected ? 'border-blue-500 bg-blue-50' : 
                isPartiallySelected ? 'border-blue-300 bg-blue-25' : 'hover:border-gray-300'}
            `}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{region.name}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegionToggle(region.id)}
                    className={`
                      text-xs font-medium
                      ${isFullySelected ? 'text-blue-600 bg-blue-100' : 
                        isPartiallySelected ? 'text-blue-600' : 'text-gray-500'}
                    `}
                  >
                    {isFullySelected ? 'Deselect All' : `Select All (${stats.total})`}
                  </Button>
                </div>
                <CardDescription>
                  {stats.selected} of {stats.total} areas selected
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {region.areas.map((area) => {
                  const isSelected = data.service_areas.includes(area.code)
                  
                  return (
                    <div
                      key={area.code}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg border cursor-pointer
                        transition-all duration-200
                        ${isSelected ? 
                          'border-blue-200 bg-blue-50' : 
                          'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleAreaToggle(area.code)}
                    >
                      <Checkbox
                        id={area.code}
                        checked={isSelected}
                        onChange={() => handleAreaToggle(area.code)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{area.icon}</span>
                          <Label 
                            htmlFor={area.code} 
                            className="font-medium cursor-pointer"
                          >
                            {area.name}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 font-mono">
                            {area.code}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {area.population} residents
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Alert>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <AlertDescription>
            <strong>Travel Considerations:</strong> Consider travel time and costs when selecting 
            service areas. Projects closer to your base of operations may be more profitable.
          </AlertDescription>
        </Alert>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center space-x-2">
              <span>💡</span>
              <span>Pro Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-green-800">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">Start with areas close to your location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">More areas = more project opportunities</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">You can update these anytime</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selection Summary */}
      {data.service_areas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Service Area Summary
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You&apos;ll receive project notifications from {data.service_areas.length} selected areas
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatPopulation(getTotalPopulation())}
              </div>
              <div className="text-sm text-blue-700">
                potential customers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Service Areas</h3>
              <p className="text-sm text-gray-600">Define your coverage zones</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {data.service_areas.length > 0 ? (
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {data.service_areas.length} areas selected
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                Select at least one service area
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
