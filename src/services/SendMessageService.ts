import SES from 'aws-sdk/clients/ses';
import { Omit } from 'yargs';

import Message, { MessageAttributes, MessageModel } from '../../src/schemas/Message';

class SendMessageService {
    private client: SES

    public constructor() {
        this.client = new SES({
            region: 'us-east-1'
        })
    }

    public async run(
        messageData: Omit<MessageAttributes, 'completedAt'>
    ): Promise<MessageModel> {
        const message = await Message.create(messageData)

        return message

        await this.client.sendEmail({
            Source: 'Richard Pinheiro <test@gmail.com>',
            Destination: {
                ToAddresses: ['Teste <testtow@gmail.com>']
            },
            Message: {
                Subject: {
                    Data: 'Hello World'
                },
                Body: {
                    Text: {
                        Data: 'Email sended successefully'
                    }
                }
            },
            ConfigurationSetName: 'SendMail'
        }).promise()
    }
}

export default SendMessageService