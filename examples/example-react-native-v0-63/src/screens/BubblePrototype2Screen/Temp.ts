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



type DeferredExecutionState<U> = {
  mode: 'TO_BE_INVOKED'
} | {
  mode: 'INVOKED';
  result: U
};

export function useDeferredExecution<T, U>(
  closureProvider: () => (args: T) => U,
  onInvoke?: (result: U) => void
): {
  invoke: (args: T) => void;
  reset: () => void;
  result: U | undefined;
  didInvoked: boolean;
} {
  const [state, setState] = React.useState<DeferredExecutionState<U>>({
    mode: 'TO_BE_INVOKED',
  });

  const closureRef = React.useRef<(() => (args: T) => U) | null>(null);
  if (!closureRef.current) {
    closureRef.current = closureProvider;
  }

  const invoke = React.useCallback((args: T) => {
    if (state.mode === 'INVOKED') return;

    const result = closureRef.current!()(args);
    setState({ mode: 'INVOKED', result });
    onInvoke?.(result);
  }, [state.mode, onInvoke]);

  const reset = React.useCallback(() => {
    setState({ mode: 'TO_BE_INVOKED' });
  }, []);

  return {
    invoke,
    reset,
    result: state.mode === 'INVOKED' ? state.result : undefined,
    didInvoked: state.mode === 'INVOKED',
  };
};

type AsyncInvocationState<U> = {
  mode: 'PENDING_INVOCATION';

} | {
  mode: 'INVOCATING';

} | {
  mode: 'INVOCATED';
  result: U

} | {
  mode: 'INVOCATION_ERROR';
  error: string
};

export function useDeferredAsyncExecution<T, U>(
  closureProvider: () => (args: T) => Promise<U>,
  onInvocationStart?: (args: T) => void,
  onInvokeCompletion?: (result: U) => void
): {
  invoke: (args: T) => void;
  reset: () => void;
  result: U | undefined;
  resultWithState: AsyncInvocationState<U>;
} {
  const [state, setState] = React.useState<AsyncInvocationState<U>>({
    mode: 'PENDING_INVOCATION',
  });

  const invoke = React.useCallback((args: T) => {
    if (state.mode === 'INVOCATING' || state.mode === 'INVOCATED') return;

    setState({ mode: 'INVOCATING' });
    onInvocationStart?.(args);

    closureProvider()(args)
      .then((result) => {
        setState({ mode: 'INVOCATED', result });
        onInvokeCompletion?.(result);
      })
      .catch((error) => {
        setState({
          mode: 'INVOCATION_ERROR',
          error: error instanceof Error ? error.message : String(error),
        });
      });
  }, [
    state.mode,
    closureProvider,
    onInvocationStart,
    onInvokeCompletion
  ]);

  const reset = React.useCallback(() => {
    setState({ mode: 'PENDING_INVOCATION' });
  }, []);

  return {
    invoke,
    reset,
    result: state.mode === 'INVOCATED' ? state.result : undefined,
    resultWithState: state,
  };
}
