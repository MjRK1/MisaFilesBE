import { Injectable, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;

  private consumer: Consumer;


  constructor() {
    this.kafka = new Kafka({
      clientId: 'misafiles',
      brokers: [`${process.env.KAFKA_HOST}:9092`]
    });
    this.consumer = this.kafka.consumer({groupId: 'misa-files-group'});
  }

  async onModuleInit() {
    // try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'file-uploaded', fromBeginning: true });
    //
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(`Received message: ${message?.value?.toString()}; topic: ${topic}`);
        }
      });
    // } catch (error) {
    //   console.log(error);
    // }
  }
}
