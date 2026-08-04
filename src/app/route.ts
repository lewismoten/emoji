import { getWindow } from "../utils/window.js";
import * as doc from "../utils/document.js";

type UrlBits = Pick<URL, "pathname" | "search" | "hash">;
const urlString = (url: UrlBits) => `${url.pathname}${url.search}${url.hash}`;

const baseUrl = () =>
  getWindow().location.href ??
  doc.getBaseUri() ??
  `http://localhost${urlString(getLocation())}`;

export const buildUrl = (bits: UrlBits | string) => {
  const base = baseUrl();
  if (typeof bits === "string") return new URL(bits, base);
  return new URL(urlString(bits), base);
};

export const hasLocation = () => !!getWindow().location;

const getLocation = (href?: string | URL): URL => {
  const base = buildUrl(getWindow().location);
  return href ? new URL(href, base) : base;
};
export const getSearch = (href?: string | URL): string =>
  getLocation(href).search;
export const getHash = (href?: string | URL): string => getLocation(href).hash;

const _searchParams = (href?: string | URL): URLSearchParams =>
  getLocation(href).searchParams;
export const getParam = (name: string, href?: string | URL) =>
  _searchParams(href).get(name) ?? "";
export const getLocale = () => {
  const locale = getLocation().pathname?.match(
    /index\.([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\.html$/,
  )?.[1];
  return locale;
};
const getHostName = () => getLocation().hostname;
export const getPathName = () => getLocation().pathname;
export const getOrigin = () => getLocation().origin;
export const getHref = () => getLocation().href;

export const isLocalPreview = () => {
  return ["127.0.0.1", "localhost"].indexOf(getHostName()) !== -1;
};

export const getMode = (): "advanced" | "developer" | "" => {
  const mode = getParam("mode");
  switch (mode) {
    case "advanced":
    case "developer":
      return mode;
    default:
      return "";
  }
};
export const getIsDeveloper = () => getMode() !== "";
export const getPanel = ():
  "favorites" | "help" | "language" | "filters" | "" => {
  const panel = getParam("panel");
  switch (panel) {
    case "favorites":
    case "help":
    case "language":
    case "filters":
      return panel;
    default:
      return "";
  }
};

type LinkParams = {
  ignore?: string[] | string;
  add?: Record<string, string>;
};
const transformParams = (params: URLSearchParams, options?: LinkParams) => {
  if (!options) return paramsToString(params);
  const newp = new URLSearchParams(params);
  if (options.ignore) {
    if (typeof options.ignore === "string") {
      newp.delete(options.ignore);
    } else {
      options.ignore.forEach((p) => newp.delete(p));
    }
  }
  if (options.add) {
    Object.entries(options.add).forEach(([key, value]) => newp.set(key, value));
  }
  return paramsToString(newp);
};
export const getSearchParams = (options?: LinkParams) =>
  transformParams(_searchParams(), options);

const paramsToString = (params: URLSearchParams) =>
  params.size === 0 ? "" : `?${params.toString()}`;

export const getLocationUrl = (options?: LinkParams) => {
  const url = getLocation();
  const searchParams = transformParams(url.searchParams, options);
  return urlString({
    pathname: url.pathname,
    search: searchParams,
    hash: url.hash,
  });
};

const getHistory = () => getWindow().history;
export const hasHistory = () => !!getHistory();
export const push = (locale: string, url: UrlBits) => {
  applyHistory("push", urlString(url), { locale });
};

type HistoryAction = "replace" | "push";
export const getHistoryState = () => getHistory().state;
export const applyHistory = (
  method: HistoryAction,
  url: string,
  state: any = getHistoryState(),
) => {
  const history = getHistory();
  switch (method) {
    case "push":
      history.pushState(state, "", url);
      break;
    case "replace":
      history.replaceState(state, "", url);
      break;
    default:
      break;
  }
};
