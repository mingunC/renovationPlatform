import { Home, Building2, Building, Store } from 'lucide-react';

export const PROPERTY_TYPES = {
  residential: {
    label: '주거용 부동산',
    description: 'Residential Property',
    types: [
      {
        value: 'DETACHED_HOUSE',
        label: 'Detached House',
        koreanLabel: '단독주택',
        description: '독립된 단독 주택',
        icon: Home,
      },
      {
        value: 'TOWNHOUSE',
        label: 'Townhouse',
        koreanLabel: '타운하우스',
        description: '연결된 타운하우스',
        icon: Building2,
      },
      {
        value: 'CONDO',
        label: 'Condo',
        koreanLabel: '콘도',
        description: '아파트/콘도미니엄',
        icon: Building,
      },
    ],
  },
  commercial: {
    label: '상업용 부동산',
    description: 'Commercial Property',
    types: [
      {
        value: 'COMMERCIAL',
        label: 'Commercial Real Estate',
        koreanLabel: '상업용 부동산',
        description: '상업용 건물, 사무실, 매장',
        icon: Store,
      },
    ],
  },
} as const;

export type PropertyTypeValue = 'DETACHED_HOUSE' | 'TOWNHOUSE' | 'CONDO' | 'COMMERCIAL';