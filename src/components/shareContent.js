// utils/share.js
export async function shareContent({ title, text, url }) {
    // Native share (best UX)
    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return { success: true, method: "native" };
        } catch (err) {
            // user cancelled → don't treat as failure
            return { success: false, reason: "cancelled" };
        }
    }

    // Fallback: copy to clipboard
    try {
        await navigator.clipboard.writeText(url);
        return { success: true, method: "clipboard" };
    } catch (err) {
        // last fallback: manual prompt
        window.prompt("Copy this link:", url);
        return { success: true, method: "prompt" };
    }
}