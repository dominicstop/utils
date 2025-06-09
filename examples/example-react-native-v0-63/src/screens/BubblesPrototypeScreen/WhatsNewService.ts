import { TabRouter } from "react-navigation";
import { getMockImageLocalURIFromMockImageURL, WHATS_NEW_MOCK_RESPONSE } from "./mock_data/WhatsNewMockData";


export type WhatsNewEntry = {
  index: number; // 0 = center
  articleURL: string; // e.g. https://cimb.com.ph/...
  imagePreviewURL: string; // e.g. https://cdn...
};

export type WhatsNewPayload = {
  totalItems: number; // 0 to 7 (min, max)
  entries: Array<WhatsNewEntry>; // [{...}]
};

export class WhatsNewService {
  
  whatsNewResponse?: WhatsNewPayload;

  getWhatsNewMock(): WhatsNewPayload {
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

  async fetchWhatsNew(args?: {
    debugShouldEnableMockLoading: boolean;
  }): Promise<WhatsNewPayload> {
    if(this.whatsNewResponse != null){
      return this.whatsNewResponse!;
    };

    const response = this.getWhatsNewMock();

    const debugShouldEnableMockLoading = args?.debugShouldEnableMockLoading ?? true;
    if(debugShouldEnableMockLoading){
      await new Promise<void>(resolve => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
    };

    return response;
  };
};

export const WhatsNewServiceShared = new WhatsNewService();