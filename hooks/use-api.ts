// hooks/use-api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Profile API 훅
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/contractor/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10분
    cacheTime: 15 * 60 * 1000, // 15분
  })
}

// Public Requests API 훅
export const usePublicRequests = (status?: string) => {
  return useQuery({
    queryKey: ['public-requests', status],
    queryFn: async () => {
      const url = status ? `/api/requests/public?status=${status}` : '/api/requests/public'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch public requests')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2분
    cacheTime: 5 * 60 * 1000, // 5분
  })
}

// Inspection Interest API 훅
export const useInspectionInterests = () => {
  return useQuery({
    queryKey: ['inspection-interests'],
    queryFn: async () => {
      const response = await fetch('/api/contractor/inspection-interest')
      if (!response.ok) {
        throw new Error('Failed to fetch inspection interests')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2분
    cacheTime: 5 * 60 * 1000, // 5분
  })
}

// Dashboard Metrics API 훅
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/contractor/dashboard-metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics')
      }
      return response.json()
    },
    staleTime: 1 * 60 * 1000, // 1분
    cacheTime: 3 * 60 * 1000, // 3분
  })
}

// Inspection Interest Mutation 훅
export const useInspectionInterestMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ requestId, willParticipate }: { requestId: string; willParticipate: boolean }) => {
      const response = await fetch('/api/contractor/inspection-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          will_participate: willParticipate,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update inspection interest')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // 관련 쿼리 무효화하여 자동 새로고침
      queryClient.invalidateQueries({ queryKey: ['inspection-interests'] })
      queryClient.invalidateQueries({ queryKey: ['public-requests'] })
    },
  })
}
