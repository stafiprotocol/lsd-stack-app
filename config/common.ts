import appJson from './app.json';

export function isDev() {
  return process.env.NEXT_PUBLIC_ENV !== 'production';
}

export function getDocHost() {
  return appJson.docHost;
}

export function getTokenPriceUrl() {
  return appJson.tokenPriceUrl;
}
