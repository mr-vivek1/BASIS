const twilio = require('twilio');

/**
 * Real-world SMS Service using Twilio.
 * It will attempt to send a real SMS if the credentials are provided in .env,
 * otherwise it will fallback to console logging for local development.
 */
const sendSMS = async (phoneNumber, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    // Simulation/Fallback for local development
    if (!accountSid || !authToken || !twilioNumber) {
        console.log('--- [SIMULATION] SMS WOULD BE SENT ---');
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log('--- Tip: Set TWILIO credentials in .env for real SMS ---');
        return true;
    }

    try {
        const client = twilio(accountSid, authToken);
        const result = await client.messages.create({
            body: message,
            from: twilioNumber,
            to: phoneNumber
        });
        console.log(`[Twilio SMS] Message sent! SID: ${result.sid}`);
        return true;
    } catch (error) {
        console.error(`[Twilio SMS Error] Failed to send to ${phoneNumber}:`, error.message);
        return false;
    }
};

module.exports = { sendSMS };
