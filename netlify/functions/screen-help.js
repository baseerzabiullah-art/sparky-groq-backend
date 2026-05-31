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
    const { imageBase64 } = JSON.parse(event.body);

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "imageBase64 is required" }),
      };
    }

    const message = await client.chat.completions.create({
      model: "llama-2-vision-90b",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: "Please analyze this homework/study question and provide a clear, helpful answer with step-by-step explanation if needed.",
            },
          ],
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
