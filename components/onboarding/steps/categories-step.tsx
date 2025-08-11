import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OnboardingData } from '@/hooks/use-contractor-onboarding'

interface CategoriesStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const RENOVATION_CATEGORIES = [
  {
    id: 'KITCHEN',
    name: 'Kitchen Renovation',
    icon: '🍳',
    description: 'Complete kitchen remodels, cabinet installation, countertops',
    examples: ['Cabinet installation', 'Countertop replacement', 'Kitchen islands', 'Backsplash'],
    complexity: 'High',
    avgProject: '$25,000',
    demand: 'High'
  },
  {
    id: 'BATHROOM',
    name: 'Bathroom Renovation',
    icon: '🚿',
    description: 'Bathroom remodels, fixtures, tiling, plumbing updates',
    examples: ['Tile installation', 'Fixture replacement', 'Vanity installation', 'Shower remodel'],
    complexity: 'High',
    avgProject: '$15,000',
    demand: 'High'
  },
  {
    id: 'BASEMENT',
    name: 'Basement Finishing',
    icon: '🏠',
    description: 'Basement development, finishing, recreation rooms',
    examples: ['Drywall & framing', 'Flooring installation', 'Electrical work', 'Recreation rooms'],
    complexity: 'Medium',
    avgProject: '$20,000',
    demand: 'Medium'
  },
  {
    id: 'FLOORING',
    name: 'Flooring Installation',
    icon: '🏗️',
    description: 'Hardwood, laminate, tile, carpet installation',
    examples: ['Hardwood installation', 'Tile work', 'Laminate flooring', 'Carpet installation'],
    complexity: 'Medium',
    avgProject: '$8,000',
    demand: 'High'
  },
  {
    id: 'PAINTING',
    name: 'Painting & Finishing',
    icon: '🎨',
    description: 'Interior and exterior painting, decorative finishes',
    examples: ['Interior painting', 'Exterior painting', 'Trim work', 'Color consultation'],
    complexity: 'Low',
    avgProject: '$3,500',
    demand: 'Very High'
  },
  {
    id: 'GENERAL',
    name: 'General Contracting',
    icon: '🔧',
    description: 'Multi-trade projects, project management, custom builds',
    examples: ['Project coordination', 'Custom builds', 'Multi-room renovations', 'Additions'],
    complexity: 'High',
    avgProject: '$35,000',
    demand: 'Medium'
  }
]

export function CategoriesStep({ data, updateData }: CategoriesStepProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = [...data.categories]
    const isSelected = currentCategories.includes(categoryId)
    
    if (isSelected) {
      updateData({
        categories: currentCategories.filter(id => id !== categoryId)
      })
    } else {
      updateData({
        categories: [...currentCategories, categoryId]
      })
    }
  }

  const selectAllCategories = () => {
    updateData({
      categories: RENOVATION_CATEGORIES.map(cat => cat.id)
    })
  }

  const clearAllCategories = () => {
    updateData({ categories: [] })
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'Very High': return 'bg-emerald-100 text-emerald-800'
      case 'High': return 'bg-blue-100 text-blue-800'
      case 'Medium': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalMarketValue = () => {
    return data.categories.reduce((total, categoryId) => {
      const category = RENOVATION_CATEGORIES.find(cat => cat.id === categoryId)
      if (category) {
        const value = parseFloat(category.avgProject.replace(/[$,]/g, ''))
        return total + value
      }
      return total
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What types of projects do you specialize in? 🔧
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the renovation categories you&apos;re qualified to handle. Choose based on your 
          skills, experience, and the types of projects you want to receive.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={selectAllCategories}>
            Select All Categories
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllCategories}>
            Clear Selection
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {data.categories.length} categories selected
          {data.categories.length > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              • {formatCurrency(getTotalMarketValue())} avg. project range
            </span>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {RENOVATION_CATEGORIES.map((category) => {
          const isSelected = data.categories.includes(category.id)
          const isExpanded = showDetails === category.id
          
          return (
            <Card 
              key={category.id} 
              className={`
                transition-all duration-200 cursor-pointer
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}
              `}
              onClick={() => handleCategoryToggle(category.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span>{category.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDetails(isExpanded ? null : category.id)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Category Stats */}
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={getComplexityColor(category.complexity)}>
                    {category.complexity} Complexity
                  </Badge>
                  <Badge className={getDemandColor(category.demand)}>
                    {category.demand} Demand
                  </Badge>
                  <Badge variant="outline">
                    {category.avgProject} avg.
                  </Badge>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Common Project Types:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.examples.map((example, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-600">{example}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Information Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center space-x-2">
              <span>💡</span>
              <span>Category Selection Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Choose Your Strengths</h4>
                <p className="text-sm text-blue-700">
                  Select categories where you have proven experience and can deliver quality work
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Consider Complexity</h4>
                <p className="text-sm text-blue-700">
                  High complexity projects offer better margins but require more expertise
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Market Demand</h4>
                <p className="text-sm text-blue-700">
                  Higher demand categories provide more bidding opportunities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center space-x-2">
              <span>📊</span>
              <span>Market Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm">Kitchen Renovations:</span>
              <Badge className="bg-green-200 text-green-800">Highest Value</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Painting Projects:</span>
              <Badge className="bg-green-200 text-green-800">Most Frequent</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">General Contracting:</span>
              <Badge className="bg-green-200 text-green-800">Best Margins</Badge>
            </div>
            <div className="pt-2 border-t border-green-300">
              <p className="text-xs text-green-700">
                Data based on platform activity in the GTA region
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selection Summary */}
      {data.categories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Selected Specializations
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You&apos;ll receive project notifications for {data.categories.length} selected categories
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.categories.map(categoryId => {
                  const category = RENOVATION_CATEGORIES.find(cat => cat.id === categoryId)
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="bg-white text-blue-800">
                      {category.icon} {category.name.replace(' Renovation', '').replace(' Installation', '').replace(' & Finishing', '')}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(getTotalMarketValue())}
              </div>
              <div className="text-sm text-blue-700">
                combined avg. project value
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for no selection */}
      {data.categories.length === 0 && (
        <Alert>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <AlertDescription>
            <strong>No categories selected:</strong> You won&apos;t receive any project notifications 
            until you select at least one category. You can always update your specializations later.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Categories & Specializations</h3>
              <p className="text-sm text-gray-600">Define your areas of expertise</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {data.categories.length > 0 ? (
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {data.categories.length} specializations selected
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                Select at least one category
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
