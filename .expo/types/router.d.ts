/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/explore`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/may-budget`; params?: Router.UnknownInputParams; } | { pathname: `/new-budget`; params?: Router.UnknownInputParams; } | { pathname: `/wedding-budget`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/budget/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/explore`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/may-budget`; params?: Router.UnknownOutputParams; } | { pathname: `/new-budget`; params?: Router.UnknownOutputParams; } | { pathname: `/wedding-budget`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/budget/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/explore${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/may-budget${`?${string}` | `#${string}` | ''}` | `/new-budget${`?${string}` | `#${string}` | ''}` | `/wedding-budget${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/explore`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/may-budget`; params?: Router.UnknownInputParams; } | { pathname: `/new-budget`; params?: Router.UnknownInputParams; } | { pathname: `/wedding-budget`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | `/budget/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | { pathname: `/budget/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
