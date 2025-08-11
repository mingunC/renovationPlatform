import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RegisterForm } from '@/components/forms/register-form'

export const metadata: Metadata = {
  title: 'Register | Renovate Platform',
  description: 'Create your account',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our renovation platform today
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Choose your account type and fill out the form below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">I&apos;m a Homeowner</TabsTrigger>
                <TabsTrigger value="contractor">I&apos;m a Contractor</TabsTrigger>
              </TabsList>
              <TabsContent value="customer" className="space-y-4">
                <div className="text-center py-4">
                  <h3 className="text-lg font-medium text-gray-900">Homeowner Account</h3>
                  <p className="text-sm text-gray-600">
                    Submit renovation requests and get quotes from contractors
                  </p>
                </div>
                <RegisterForm userType="CUSTOMER" />
              </TabsContent>
              <TabsContent value="contractor" className="space-y-4">
                <div className="text-center py-4">
                  <h3 className="text-lg font-medium text-gray-900">Contractor Account</h3>
                  <p className="text-sm text-gray-600">
                    Browse requests and submit bids to grow your business
                  </p>
                </div>
                <RegisterForm userType="CONTRACTOR" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}