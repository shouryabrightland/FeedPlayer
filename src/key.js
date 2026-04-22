import { AppState } from "./AppState.class";
import { buildConfig } from "./config";
/**
 * @param {AppState} appstate 
 * @param {string} key 
*/
export async function handleKey(key,appstate){
      try {
        if (!isValidKey(key)) {
          appstate.isValidKey.set(-1);
          return;
        }

        console.log("fetching key:", key);

        const data = await safeFetchJSON(key + "index.json", { maxSize: 1024, timeout: 3000 });

        if (!data?.isKey || !data?.config) {
          throw new Error("Invalid key structure");
        }

        const configRes = await fetch(key + data.config);
        const configData = await configRes.json();

        appstate.CONFIG.set(buildConfig(configData, key));
        appstate.isValidKey.set(1);
        appstate.LoginNeeded.set(false);
        storeKey(key);

      } catch (err) {
        console.log("invalid Key", err);
        appstate.isValidKey.set(-1);
      }
};


async function safeFetchJSON(url, { maxSize = 1024, timeout = 3000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });

    // ❗ 1. Check status
    if (!res.ok) {
      throw new Error("HTTP error: " + res.status);
    }

    // ❗ 2. Check content type
    const type = res.headers.get("content-type") || "";
    if (!type.includes("application/json")) {
      throw new Error("Not JSON (probably HTML page)");
    }

    // ❗ 3. Check size (header)
    const length = res.headers.get("content-length");
    if (length && Number(length) > maxSize) {
      throw new Error("File too large");
    }

    const text = await res.text();

    // ❗ 4. Extra safety: detect HTML manually
    if (text.trim().startsWith("<")) {
      throw new Error("Received HTML instead of JSON");
    }

    if (text.length > maxSize) {
      throw new Error("File too large");
    }

    return JSON.parse(text);

  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
function isValidKey(key) {
  return typeof key === "string" &&
    key.length < 50 &&                 // limit size
    /^[a-zA-Z0-9/_-]+$/.test(key);    // whitelist chars
}


export function storeKey(key) {
  if (key) localStorage.setItem("user_key", key);
}

export function getKey() {
  const params = new URLSearchParams(window.location.search);
  const keyFromUrl = params.get("key");
  if (keyFromUrl) {
    storeKey(keyFromUrl)
  }
  return keyFromUrl || localStorage.getItem("user_key")
}
