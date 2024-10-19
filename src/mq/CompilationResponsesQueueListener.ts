import eventBus from "../utils/eventBus";
import { connectToRabbitMQ } from "./rabbitmq.mq";

export const compilationRequestsQueueListener = async () => {
  try {
    const channel = await connectToRabbitMQ();

    const queue = "compilation_responses";

    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`Waiting for messages in ${queue} queue...`);

    channel.consume(queue, async (message: any) => {
      if (message !== null) {
        const content = message.content.toString();
        console.log(`Received message from ${queue}:`, content);

        const jsonMessage = JSON.parse(content);
        eventBus.emit("compilationResponse", jsonMessage);
        
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
};
