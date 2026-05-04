export function encodeID(raw) {
    if (!raw) return "";
    return btoa(raw)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // return raw;
}

export function decodeID(encoded) {
    if (!encoded) return "";
    encoded = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (encoded.length % 4) {
      encoded += "=";
    }

    return atob(encoded);

    // return encoded
}