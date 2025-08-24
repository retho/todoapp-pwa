import { useCallback, useReducer, useRef } from 'react';

export const panic = (error_message: string): never => {
  throw new Error(error_message);
};
export const assertNever = (val: never): never =>
  panic(`Unexpected never value: ${JSON.stringify(val)}`);
export const assertNeverNoPanic = (val: never): void => void val;

export const useForceRender = (): (() => void) =>
  useReducer<number, []>((s) => s + 1, 0)[1];

export const useRefedValue = <T>(val: T) => {
  const ref = useRef(val);
  ref.current = val;
  return ref;
};
// * https://beta.reactjs.org/apis/react/useEvent
// * https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRefedFn = <F extends (...args: any[]) => any>(fn: F): F => {
  const handlerRef = useRef<F>(fn);
  handlerRef.current = fn;
  return useCallback<F>(
    ((...args) => {
      return handlerRef.current(...args);
    }) as F,
    []
  );
};

export const timeout = (ms: number): Promise<void> => new Promise((rsv) => setTimeout(rsv, ms));

export const nbsp = '\xa0';
export const dash = '—';

// * https://habr.com/ru/company/oleg-bunin/blog/499634/
// * https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/
// * https://habr.com/ru/company/oleg-bunin/blog/499634/
declare const brand: unique symbol;
export type Brand<TypeName extends string, T> = { [brand]: TypeName } & T;

// * https://stackoverflow.com/questions/33915459/algebraic-data-types-in-typescript
// * https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
export type ADT<K extends string, P = unknown> = { kind: K } & P;

// * https://stackoverflow.com/questions/41253310/typescript-retrieve-element-type-information-from-array-type
export type InferArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type InferArguments<T extends (...args: unknown[]) => unknown> = Parameters<T>;
export type InferPromisePayload<T extends Promise<unknown>> = T extends Promise<infer P>
  ? P
  : never;
export type InferRecordValues<T extends Record<string, unknown>> = T extends Record<string, infer V> ? V : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferReturnType<T extends (...args: any) => any> = ReturnType<T>;

export const iterate = <T>(
  initial: T,
  next: (x: T) => T,
  takeWhile: (x: T) => boolean
): T[] => {
  const res: T[] = [];
  let current = initial;
  while (true) {
    if (!takeWhile(current)) {
      break;
    }
    res.push(current);
    current = next(current);
  }
  return res;
};

