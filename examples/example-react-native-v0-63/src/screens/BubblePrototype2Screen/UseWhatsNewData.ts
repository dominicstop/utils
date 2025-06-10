import * as React from "react";
import { WhatsNewConsolidatedData, WhatsNewServiceShared } from "./WhatsNewService";
import { LoadingStateWithData, useAsyncLazyRef, useLazyRef } from "./Temp";
import { MOCK_DEBUG_CONFIG } from "./mock_data/WhatsNewMockData";

export type WhatsNewDataState = LoadingStateWithData<WhatsNewConsolidatedData, string>

export function useWhatsNewData(args?: {
  debugMaxBubbleCount?: number;
}): WhatsNewDataState {

  const [loadingState, setLoadingState] = React.useState<WhatsNewDataState>({
    mode: 'LOADING',
  });

  const debugMetadata = useLazyRef(() => ({
    didLoad: false,
  }));

  const [_, resetWhatNewData] = useAsyncLazyRef(
    async () => {
      const data = await WhatsNewServiceShared.fetchWhatsNewDataIfNeeded({
        debugShouldEnableMockLoading: !debugMetadata.current.didLoad,
      });

      debugMetadata.current.didLoad = true;

      const newEntries = (() => {
        const debugMaxBubbleCount = args?.debugMaxBubbleCount;
        if(debugMaxBubbleCount == null){
          return data.entries;
        };

        return data.entries.slice(0, debugMaxBubbleCount);
      })();

      return {
        ...data,
        entries: newEntries,
        totalItems: newEntries.length,
      };
    },
    (error) => {
      const errorMessage = (() => {
        if (typeof error === "string") {
          return error;

        } else if (error instanceof Error) {
          return error.message;
        };

        return "An unknown error occurred";
      })();

      setLoadingState({
        mode: 'LOADING_ERROR',
        errorData: errorMessage
      });
    },
    (data) => {
      setLoadingState({
        mode: 'LOADED',
        loadedData: data,
      });
    }
  );

  MOCK_DEBUG_CONFIG.isDebug && React.useEffect(() => {
    if(!debugMetadata.current.didLoad){
      return;
    };

    setLoadingState({ mode: 'LOADING' });
    resetWhatNewData();

  }, [args?.debugMaxBubbleCount]);

  return loadingState;
};
