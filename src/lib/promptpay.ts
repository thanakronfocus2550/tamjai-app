/**
 * PromptPay QR Code Generator Utility
 * Based on EMVCo Standard
 */

export function generatePromptPayPayload(id: string, amount?: number): string {
    // Clean the ID (remove non-digits)
    const cleanId = id.replace(/[^0-9]/g, "");

    // Format PromptPay ID
    // If length is 10 (mobile), format as 0066 + 9 digits
    // If length is 13 (tax id), use as is
    let formattedId = "";
    if (cleanId.length === 10) {
        formattedId = "0066" + cleanId.substring(1);
    } else {
        formattedId = cleanId;
    }

    // Payload segments
    const segments: string[] = [
        "000201", // Payload Format Indicator
        "010212", // Point of Initiation Method (12 = Dynamic/Embedded Amount)
        formatSegment("29", [
            "0016A000000677010111", // PromptPay AID
            formatSegment("01", formattedId)
        ].join("")),
        "5303764", // Transaction Currency (764 = THB)
    ];

    if (amount !== undefined && amount > 0) {
        segments.push(formatSegment("54", amount.toFixed(2)));
    }

    segments.push("5802TH"); // Country Code
    segments.push("6304");   // Checksum indicator

    const payload = segments.join("");
    return payload + crc16(payload);
}

function formatSegment(tag: string, value: string): string {
    const len = value.length.toString().padStart(2, "0");
    return tag + len + value;
}

/**
 * CRC16-XMODEM Implementation
 */
function crc16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}
