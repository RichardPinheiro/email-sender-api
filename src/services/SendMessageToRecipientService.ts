import SES from 'aws-sdk/clients/ses';

import MessageData from './structures/MessageData';

class SendMessageToRecipientService {
    private client: SES;

    public constructor() {
        this.client = new SES({
            region: 'us-east-1',
        });
    }

    public async run(to: string, messageData: MessageData): Promise<void> {
        await this.client.sendEmail({
            Source: 'Richard Pinheiro <test@gmail.com>',
            Destination: {
                ToAddresses: [to]
            },
            Message: {
                Subject: {
                    Data: messageData.subject
                },
                Body: {
                    Text: {
                        Data: messageData.body
                    }
                }
            },
            ConfigurationSetName: 'SendMail'
        }).promise()
    }
}

export default SendMessageToRecipientService