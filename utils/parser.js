const parseAIResponse = (response) => {
  try {
    if (typeof response === "object" && response !== null) {
      return response;
    }

    if (typeof response !== "string") {
      throw new Error("AI response is not a string or object");
    }

    const cleanedResponse = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;

    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Invalid AI JSON Response");
  }
};

module.exports = {
    parseAIResponse
};