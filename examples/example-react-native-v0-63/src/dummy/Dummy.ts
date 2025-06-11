
// Mock implementations for modules used in WhatsNewService

// Mock for rn-lib/nativeInterface
export const Network = {
  post: async ({ path, params }: { path: string; params: any }) => {
    return {
      data: [
        {
          id: "promo1",
          title: "Promo Title 1",
          bannerImg: "https://example.com/banner1.jpg",
          promotionId: "promo1",
        },
      ],
    };
  },
};

// Mock for @network/endpoints
export const ENDPOINTS = {
  COMMON: {
    QUERY_BANNERS_LIST: "/mock/banners",
    QUERY_PROMOS_LIST: "/mock/promos",
  },
};

// Mock for @interfaces/iAppUtil
export namespace iAppUtil {
  export type iNewsData = {
    promotionId: string;
    bannerImg: string;
  };

  export type iPromotionData = {
    id: string;
    title: string;
  };
}

// Mock for @utilz/commonUtils
export const commonUtils = {
  isValidResponse: (response: any) => {
    return response && Array.isArray(response.data);
  },
};

// Mock for @utilz/globalDataUtils
export const globalDataUtils = {
  getCommonParams: () => ({
    lang: "en",
    region: "PH",
  }),
};

// Mock for ./mock_data/WhatsNewMockData
export const getMockImageLocalURIFromMockImageURL = (url: string) => {
  return `file://mocked/${url.split("/").pop()}`;
};

export const MOCK_DEBUG_CONFIG = {
  shouldUseMock: true,
  shouldLogNetwork: true,
};

export const WHATS_NEW_MOCK_RESPONSE = {
  totalItems: 2,
  entries: [
    {
      index: 0,
      promoID: "promo1",
      imagePreviewURL: "https://example.com/mock1.jpg",
      articleTitle: "Mock Promo 1",
    },
    {
      index: 1,
      promoID: "promo2",
      imagePreviewURL: "https://example.com/mock2.jpg",
      articleTitle: "Mock Promo 2",
    },
  ],
};


export namespace Dashboard {
  export type SectionItem = any;
};
