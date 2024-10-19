import amqp from "amqplib";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export const connectToRabbitMQ = async (): Promise<amqp.Channel> => {
  if (channel) {
    return channel;
  }

  if (!connection) {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  }

  channel = await connection.createChannel();
  console.log('RabbitMQ connection and channel established');
  
  return channel;
};

export const sendMessageToQueue = async (queue: string, message: any) => {
  const ch = await connectToRabbitMQ();

  await ch.assertQueue(queue, { durable: true });
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

  console.log(`Message sent to ${queue}`);
};
