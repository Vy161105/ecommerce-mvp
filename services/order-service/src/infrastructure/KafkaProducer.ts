import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const producer = kafka.producer();

let connected = false;

export async function publishOrderCreated(order: {
  id: string;
  [key: string]: any;
}) {
  try {
    if (!connected) {
      await producer.connect();
      connected = true;
    }

    await producer.send({
      topic: "orders",
      messages: [
        {
          key: order.id,
          value: JSON.stringify({
            event: "OrderCreated",
            orderId: order.id,
            order,
            createdAt: new Date().toISOString(),
          }),
        },
      ],
    });
  } catch (error) {
    console.error("Kafka publish failed:", error);
    throw error;
  }
}
