import appData from "./data/appData.json";

export type WelcomeMessage = [string, string];

function selectMessage(messages: WelcomeMessage[], index: number) {
    const message = messages[index % messages.length];
    return message.map((line) => line.replaceAll("{firstName}", appData.user.firstName)) as WelcomeMessage;
}

export function getWelcomeMessage(): WelcomeMessage {
    const time = new Date();
    const messageIndex = time.getDate();
    const hour = time.getHours();

    if (hour < 12) return selectMessage(appData.welcomeMessages.morning as WelcomeMessage[], messageIndex);
    if (hour <= 18) return selectMessage(appData.welcomeMessages.afternoon as WelcomeMessage[], messageIndex);
    if (hour < 21) return selectMessage(appData.welcomeMessages.evening as WelcomeMessage[], messageIndex);
    return selectMessage(appData.welcomeMessages.night as WelcomeMessage[], messageIndex);
}
