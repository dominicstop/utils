import { Image } from "react-native";
import { WhatsNewEntry, WhatsNewConsolidatedData } from "../WhatsNewService";

export const MOCK_DEBUG_CONFIG = {
    isDebug: __DEV__ && false,
    shouldUseMock: __DEV__ && true,
    maxItemsToShow: 7,
    showBubbleGroupBoundingBox: __DEV__ && false,
    shouldLogNetwork: __DEV__ && true,
};

const MOCK_KEYS = {
    mock00: 'mock00',
    mock01: 'mock01',
    mock02: 'mock02',
    mock03: 'mock03',
    mock04: 'mock04',
    mock05: 'mock05',
    mock06: 'mock06',
};

type MockKey = keyof typeof MOCK_KEYS;

const MOCK_IMAGE_URL_MAP: Record<MockKey, string> = {
    mock00: "https://cdn.cimb.com.ph/whats-new/bubble_00",
    mock01: "https://cdn.cimb.com.ph/whats-new/bubble_01",
    mock02: "https://cdn.cimb.com.ph/whats-new/bubble_02",
    mock03: "https://cdn.cimb.com.ph/whats-new/bubble_03",
    mock04: "https://cdn.cimb.com.ph/whats-new/bubble_04",
    mock05: "https://cdn.cimb.com.ph/whats-new/bubble_05",
    mock06: "https://cdn.cimb.com.ph/whats-new/bubble_06",
};

type PartialWhatsNewEntry = Pick<WhatsNewEntry,
    | 'articleTitle'
    | 'promoID'
>;

const MOCK_WHATS_NEW_ENTRY_PARTIAL: Record<MockKey, PartialWhatsNewEntry> = {
    mock00: {
        promoID: "https://www.cimb.com/en/home.html",
        articleTitle: "New Home",
    },
    mock01: {
        promoID: "https://www.cimb.com/en/who-we-are/contact-us.html",
        articleTitle: "Contact Us",
    },
    mock02: {
        promoID: "https://www.cimb.com/en/newsroom.html",
        articleTitle: "News Room",
    },
    mock03: {
        promoID: "https://www.cimb.com/en/who-we-are/awards.html",
        articleTitle: "Awards",
    },
    mock04: {
        promoID: "https://www.cimb.com/en/careers/working-at-cimb.html",
        articleTitle: "Work With Us",
    },
    mock05: {
        promoID: "https://www.cimb.com/en/who-we-are/contact-us.html",
        articleTitle: "Contact Us Again",
    },
    mock06: {
        promoID: "https://www.cimb.com/en/newsroom/2025/cimb-commits-rm10-billion-to-accelerate-growth-in-johor-singapore-special-economic-zone.html",
        articleTitle: "Grow!",
    },
};

const MOCK_IMAGE_PATH: Record<MockKey, any> = {
    mock00: require("./bubble_00.png"),
    mock01: require("./bubble_01.png"),
    mock02: require("./bubble_02.png"),
    mock03: require("./bubble_03.png"),
    mock04: require("./bubble_04.png"),
    mock05: require("./bubble_05.png"),
    mock06: require("./bubble_06.png"),
};

export const WHATS_NEW_MOCK_RESPONSE: WhatsNewConsolidatedData = (() => {
    const entries: Array<WhatsNewEntry> = [];

    let index = 0;
    for(const key in MOCK_KEYS){
        const mockKey = key as unknown as MockKey;
        
        
        entries.push({
            index: index++,
            imagePreviewURL: MOCK_IMAGE_URL_MAP[mockKey],
            ...MOCK_WHATS_NEW_ENTRY_PARTIAL[mockKey],
        });
    };

    return {
        entries,
        totalItems: index + 1,
    };
})();

export function getMockImageLocalURIFromMockImageURL(mockUrl: string): string | undefined {
    
    const matchingMockKey: MockKey | undefined = (() => {
        for(const mockKey of Object.keys(MOCK_KEYS)) {
            const currentMockURL = MOCK_IMAGE_URL_MAP[mockKey as MockKey];
            if(currentMockURL === mockUrl){
                return mockKey as MockKey;
            };
        };

        return undefined;
    })();
    

    if(matchingMockKey == null){
        return;
    };

    const asset = MOCK_IMAGE_PATH[matchingMockKey];
    const resolvedAsset = Image.resolveAssetSource(asset);
    return resolvedAsset.uri;
};

export function replaceMockImageURLWithLocalMockImageURI(payload: WhatsNewConsolidatedData){
    const rawMockData = payload;
    const whatsNewEntries = rawMockData.entries;

    for (let index = 0; index < whatsNewEntries.length; index++) {
        const currentEntry = whatsNewEntries[index];

        const imagePreviewMockURL = currentEntry.imagePreviewURL;
        const localPathURIForImagePreviewURL = getMockImageLocalURIFromMockImageURL(imagePreviewMockURL);

        whatsNewEntries[index] = {
            ...currentEntry,
            imagePreviewURL: localPathURIForImagePreviewURL ?? '',
        };
    };
};