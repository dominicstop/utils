import React, { MutableRefObject } from "react";


// MARK: Types
// -----------

export type LoadingStateWithData<T, U> = {
    mode: 'LOADING';
} | {
    mode: 'LOADED';
    loadedData: T; 
} | {
    mode: 'LOADING_ERROR';
    errorData: U;
};

export type LoadingState = LoadingStateWithData<unknown, unknown>['mode'];

// MARK: Helpers
// -------------

export function useLazyRef<T>(
    initialValueProvider: () => T
) {
    const ref = React.useRef<T | 'uninitialized'>('uninitialized');
    if (ref.current === 'uninitialized') {
        ref.current = initialValueProvider();
    };

    return ref as unknown as MutableRefObject<T>;
};

export function useAsyncLazyRef<T>(
    promise: () => Promise<T>,
    onReject: ((reason: unknown) => void) | undefined = undefined,
    completion: ((resolvedValue: T) => void) | undefined = undefined
): [
    ref: MutableRefObject<T | undefined>, 
    reset: () => void,
] {

    const ref = React.useRef<T | 'uninitialized'>('uninitialized');
    if (ref.current === 'uninitialized') {
        // @ts-ignore
        ref.current = undefined;

        promise().then((result) => {
            ref.current = result;
            completion?.(result);

        }).catch(reason => {
            onReject?.(reason);
        });
    };

    return [
        ref as unknown as MutableRefObject<T>,
        () => {
            ref.current = 'uninitialized';
        },
    ];
};