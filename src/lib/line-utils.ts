export const sendLineFlexMessage = async (to: string, orderData: any) => {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken || !to) return;

    const flexMessage = {
        type: "flex",
        altText: `ออเดอร์ใหม่ #${orderData.orderId}`,
        contents: {
            type: "bubble",
            header: {
                type: "box",
                layout: "horizontal",
                contents: [
                    {
                        type: "text",
                        text: "ออเดอร์ใหม่! 📦",
                        weight: "bold",
                        size: "xl",
                        color: "#FF6B00"
                    }
                ]
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: `#${orderData.orderId}`,
                        weight: "bold",
                        size: "md",
                        margin: "md"
                    },
                    {
                        type: "separator",
                        margin: "lg"
                    },
                    {
                        type: "box",
                        layout: "vertical",
                        margin: "lg",
                        spacing: "sm",
                        contents: orderData.items.map((item: any) => ({
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                {
                                    type: "text",
                                    text: `${item.name} x${item.qty}`,
                                    size: "sm",
                                    color: "#555555",
                                    flex: 4
                                },
                                {
                                    type: "text",
                                    text: `฿${item.price * item.qty}`,
                                    size: "sm",
                                    color: "#111111",
                                    align: "end",
                                    flex: 2
                                }
                            ]
                        }))
                    },
                    {
                        type: "separator",
                        margin: "lg"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        margin: "lg",
                        contents: [
                            {
                                type: "text",
                                text: "ยอดรวมทั้งหมด",
                                size: "md",
                                weight: "bold",
                                color: "#111111"
                            },
                            {
                                type: "text",
                                text: `฿${orderData.totalAmount}`,
                                size: "md",
                                weight: "bold",
                                color: "#FF6B00",
                                align: "end"
                            }
                        ]
                    }
                ]
            },
            footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        style: "primary",
                        height: "sm",
                        color: "#FF6B00",
                        action: {
                            type: "uri",
                            label: "ดูรายละเอียดออเดอร์",
                            uri: `${process.env.NEXTAUTH_URL}/menu/${orderData.shopSlug}/admin`
                        }
                    }
                ]
            }
        }
    };

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
                to,
                messages: [flexMessage]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("LINE Messaging API Error:", errorData);
        }
    } catch (error) {
        console.error("Failed to send LINE message:", error);
    }
};
