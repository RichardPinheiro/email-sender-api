import SES from 'aws-sdk/clients/ses';

class SendmessageService {
    private client: SES

    public constructor() {
        this.client = new SES({
            region: 'us-east-1'
        })
    }

    public async run(): Promise<void> {
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

export default SendmessageService