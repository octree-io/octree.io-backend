import OpenAI from "openai";

class OpenAIFacade {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  
  async sendChatGptMessage(instructions: string, prompt: string) {
    const response = await this.client.responses.create({
      model: 'gpt-4o-mini',
      instructions,
      input: prompt,
    });

    return response.output_text;
  }
}

const openAIFacade = new OpenAIFacade();
export default openAIFacade;
