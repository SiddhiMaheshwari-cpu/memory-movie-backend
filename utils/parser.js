const parseAIResponse = (response) => {
    try {
        const cleanedResponse = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleanedResponse);
    } catch (error) {
        throw new Error("Invalid AI JSON Response");
    }
};

module.exports = {
    parseAIResponse
};