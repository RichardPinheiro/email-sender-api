import MailMock from '../utils/MailMock';

import SendMessageToRecipientService from '../../src/services/SendMessageToRecipientService';

describe('Send Message to recipient', () => {
    it('should send message to the recipent', async () => {
        const SendMessageToRecipient = new SendMessageToRecipientService()

        SendMessageToRecipient.run('richard@gmail.com', {
            subject: 'Hello world',
            body: 'Junt testing'
        })

        expect(MailMock.sendEmail).toHaveBeenCalled()
    })
})