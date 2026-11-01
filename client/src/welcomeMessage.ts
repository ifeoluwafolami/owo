export type WelcomeMessage = [string, string];

const messages = {
    morning: [["Hello, sunshine!", "Let’s make today a no-regrets spending day."], ["Good morning, {firstName}!", "Let’s keep your wallet out of trouble today."]],
    afternoon: [["Halfway through the day.", "How's your wallet holding up?"], ["Good afternoon, {firstName}", "Catch me up on your day!"]],
    evening: [["The day is winding down.", "Let's see where it all went."], ["Good evening, {firstName}!", "Log whatever you spent today."]],
    night: [["Burning the midnight oil, {firstName}?", "Keep your hands off the add-to-cart button."], ["Good night, {firstName}.", "One last look, then bed."]],
} satisfies Record<string, WelcomeMessage[]>;

function selectMessage(messages: WelcomeMessage[], index: number, firstName: string) {
    const message = messages[index % messages.length];
    return message.map((line) => line.replaceAll("{firstName}", firstName)) as WelcomeMessage;
}

export function getWelcomeMessage(firstName = "friend"): WelcomeMessage {
    const time = new Date();
    const messageIndex = time.getDate();
    const hour = time.getHours();

    if (hour < 12) return selectMessage(messages.morning, messageIndex, firstName);
    if (hour <= 18) return selectMessage(messages.afternoon, messageIndex, firstName);
    if (hour < 21) return selectMessage(messages.evening, messageIndex, firstName);
    return selectMessage(messages.night, messageIndex, firstName);
}
