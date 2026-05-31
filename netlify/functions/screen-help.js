const Groq = require("groq-sdk").default;

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { pageText } = JSON.parse(event.body);

    if (!pageText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "pageText is required" }),
      };
    }

    const limitedText = pageText.substring(0, 3000);

    const message = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Please analyze this page content and provide helpful homework/study assistance. Focus on key concepts, explanations, and answers to any questions visible on the page.\n\nPage content:\n${limitedText}`,
        },
      ],
    });

    const answer = message.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
