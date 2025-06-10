import { getMockImageLocalURIFromMockImageURL, MOCK_DEBUG_CONFIG, WHATS_NEW_MOCK_RESPONSE } from "./mock_data/WhatsNewMockData";

import { commonUtils, ENDPOINTS, globalDataUtils, iAppUtil, Network } from "../../dummy/Dummy";
// import { Network } from "rn-lib/nativeInterface";
// import { ENDPOINTS } from "@network/endpoints";
// import { iAppUtil } from "@interfaces/iAppUtil";
// import { commonUtils } from "@utilz/commonUtils";
// import { globalDataUtils } from "@utilz/globalDataUtils";


export type WhatsNewEntry = {
  index: number; // 0 = center
  promoID: string;
  imagePreviewURL: string; // e.g. https://cdn...
  articleTitle?: string; // Optional, e.g. "New Promo!"
};

export type BannerList = Array<iAppUtil.iNewsData>;
export type PromoList = Array<iAppUtil.iPromotionData>;
export type WhatsNewList = Array<WhatsNewEntry>;

export type WhatsNewConsolidatedData = {
  totalItems: number; // 0 to 7 (min, max)
  entries: WhatsNewList; // [{...}]
};

export class WhatsNewService {

  static minRefereshDurationMS = 60 * 60 * 1000;

  private _cachedBannerList?: DataWithTimestamp<BannerList>;
  private _cachedPromoList?: DataWithTimestamp<PromoList>;

  private _cachedWhatsNewList?: WhatsNewList;

  get isCachedBannerListStale(): boolean {
    if(this._cachedBannerList == null){
      return true;
    };

    return PrivateHelpers.isWrappedDataStale(this._cachedBannerList);
  };

  get isCachedPromoListStale(): boolean {
    if(this._cachedBannerList == null){
      return true;
    };

    return PrivateHelpers.isWrappedDataStale(this._cachedBannerList);
  };

  get isCachesStale(): boolean {
    return this.isCachedBannerListStale || this.isCachedPromoListStale;
  };

  // MARK: - Methods
  // ---------------

  getWhatsNewMock(): WhatsNewConsolidatedData {
    const rawMockData = { ...WHATS_NEW_MOCK_RESPONSE };
    const whatsNewEntries: Array<WhatsNewEntry> = [];

    for (let index = 0; index < rawMockData.entries.length; index++) {
      const currentEntry = rawMockData.entries[index];

      const imagePreviewMockURL = currentEntry.imagePreviewURL;
      const localPathURIForImagePreviewURL = getMockImageLocalURIFromMockImageURL(imagePreviewMockURL);

      whatsNewEntries.push({
        ...currentEntry,
        imagePreviewURL:
        localPathURIForImagePreviewURL ?? 'https://en.m.wikipedia.org/wiki/File:Wikipedia-logo.png',
      });
    };

    return {
      ...rawMockData,
      entries: whatsNewEntries.reverse(),
    };
  };

  clearCachesIfStale(){
    if(this.isCachedBannerListStale){
      this._cachedBannerList = undefined;
    };

    if(this.isCachedPromoListStale){
      this._cachedPromoList = undefined;
    };
  };

  // MARK: - Methods - Fetch Data
  // ----------------------------

  async fetchBannerList(): Promise<BannerList> {
    const requestParams = {
      ...globalDataUtils.getCommonParams()
    };

    const response: any = await Network.post({
      path: ENDPOINTS.COMMON.QUERY_BANNERS_LIST,
      params: {},
    });

    MOCK_DEBUG_CONFIG.shouldLogNetwork &&  console.log({
      'WhatsNewService.fetchBannerList.response': response,
      'WhatsNewService.fetchBannerList.requestParams': requestParams,
      "WhatsNewService.fetchBannerList.response.data": JSON.stringify(response.data),
    });

    const isValidResponse = commonUtils.isValidResponse(response);
    if(!isValidResponse) {
      throw new Error('Invalid response for "Banner List"');
    };

    const hasData = Array.isArray(response.data) && response.data.length > 0;
    if(!hasData){
      return [];
    };

    return response.data;
  };

  async fetchPromoList(): Promise<PromoList>{
    const response = await Network.post({
      path: ENDPOINTS.COMMON.QUERY_PROMOS_LIST,
      params: {
        ...globalDataUtils.getCommonParams()
      },
    });

    MOCK_DEBUG_CONFIG.shouldLogNetwork && console.log({
      'WhatsNewService.fetchPromoList.response': response,
      "WhatsNewService.fetchPromoList.response.data": JSON.stringify(response.data),
    });

    const isValidResponse = commonUtils.isValidResponse(response);
    if(!isValidResponse) {
      throw new Error('Invalid response for "Promo List"');
    };

    const hasData = Array.isArray(response.data) && response.data.length > 0;
    if(!hasData){
      return [];
    };

    return response.data;
  };

  // MARK: - Methods - Fetch Data (w/ Caching)
  // ----------------------------------------

  async fetchBannerListIfNeeded() {
    if(
      this._cachedBannerList != null &&
      !this.isCachedBannerListStale
    ){
      return this._cachedBannerList!.data;
    };

    const response = await this.fetchBannerList();
    this._cachedBannerList = {
      timestamp: Date.now(),
      data: response,
    };

    return response;
  };

  async fetchPromoListIfNeeded() {
    if(
      this._cachedPromoList != null &&
      this.isCachedPromoListStale
    ){
      return this._cachedPromoList.data;
    };

    const response = await this.fetchPromoList();
    this._cachedPromoList = {
      timestamp: Date.now(),
      data: response,
    };
    return response;
  };

  async fetchtWhatsNewListIfNeeded(){
    if(
      !this.isCachesStale &&
      this._cachedWhatsNewList != undefined
    ){
      return this._cachedWhatsNewList;
    };

    const bannerList = await this.fetchBannerListIfNeeded();
    const promoList = await this.fetchPromoListIfNeeded();

    type PromoMap = Partial<Record<string, (typeof promoList)[number]>>;

    const promoItemsMapped = promoList.reduce<PromoMap>((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});

    const whatsNewItems: Array<WhatsNewEntry> = bannerList.map((bannerItem, bannerIndex) => {
      const promoItem = promoItemsMapped[bannerItem.promotionId];

      return ({
        index: bannerIndex,
        imagePreviewURL: bannerItem.bannerImg,
        articleTitle: promoItem?.title,
        promoID: bannerItem.promotionId,
      });
    });

    this._cachedWhatsNewList = whatsNewItems;

    MOCK_DEBUG_CONFIG.shouldLogNetwork && console.log({
      'WhatsNewService.fetchtWhatsNewListIfNeeded.bannerList': bannerList,
      'WhatsNewService.fetchtWhatsNewListIfNeeded.promoList': promoList,
      'WhatsNewService.fetchtWhatsNewListIfNeeded.promoItemsMapped': promoItemsMapped,
      'WhatsNewService.fetchtWhatsNewListIfNeeded.whatsNewItems': whatsNewItems,
    });

    return whatsNewItems;
  };

  async fetchWhatsNewDataIfNeeded(args?: {
    debugShouldEnableMockLoading: boolean;
  }): Promise<WhatsNewConsolidatedData> {

    if(MOCK_DEBUG_CONFIG.shouldUseMock) {
      const debugShouldEnableMockLoading = args?.debugShouldEnableMockLoading ?? true;
      if(debugShouldEnableMockLoading){
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 3000);
        });
      };

      return this.getWhatsNewMock();
    };

    const whatsNewList = await this.fetchtWhatsNewListIfNeeded();

    return ({
      entries: whatsNewList,
      totalItems: whatsNewList.length
    });
  };
};

// MARK: - Helpers
// ---------------

type DataWithTimestamp<T> = {
  data: T;
  timestamp: number;
};

class PrivateHelpers {
  static isWrappedDataStale<T>(
    wrappedData: DataWithTimestamp<T>,
    currentTimestampMS: number | undefined = undefined
  ) {
    const currentTimestamp = currentTimestampMS ?? Date.now();
    const lastFetchedTimestamp = wrappedData.timestamp ?? 0;

    const elapsedTimeMS = currentTimestamp - lastFetchedTimestamp;
    return elapsedTimeMS > WhatsNewService.minRefereshDurationMS;
  };
};

export const WhatsNewServiceShared = new WhatsNewService();
