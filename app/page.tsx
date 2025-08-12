import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Renovate Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect homeowners with trusted renovation contractors. Get quotes, compare bids, and transform your home with confidence.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏠 For Homeowners
              </CardTitle>
              <CardDescription>
                Get your renovation project started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Submit detailed renovation requests</li>
                <li>• Compare multiple contractor bids</li>
                <li>• View contractor ratings and reviews</li>
                <li>• Track project progress</li>
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link href="/request">Submit Request</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔨 For Contractors
              </CardTitle>
              <CardDescription>
                Grow your renovation business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Browse renovation requests</li>
                <li>• Submit competitive bids</li>
                <li>• Build your reputation</li>
                <li>• Manage your projects</li>
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link href="/dashboard">Contractor Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Why Choose Us
              </CardTitle>
              <CardDescription>
                Trusted renovation platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Verified contractor profiles</li>
                <li>• Transparent pricing</li>
                <li>• Secure communication</li>
                <li>• Project protection</li>
              </ul>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/about">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Renovation?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of homeowners and contractors who trust our platform for their renovation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register?type=customer">I&apos;m a Homeowner</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register?type=contractor">I&apos;m a Contractor</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}