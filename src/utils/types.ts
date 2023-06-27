// 自定义任意函数类型
export type AnyFunction<T> = (...args: any[]) => T;

export const tuple = <T extends string[]>(...args: T) => args;