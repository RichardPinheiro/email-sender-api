import 'dotenv/config';

import MailQueue, { MailJobData } from './queues/MailQueue';

import SendMessageToRecipientService from './services/SendMessageToRecipientService';

MailQueue.process(async job => {
    const { to, messageData } = job.data as MailJobData

    const SendMessageToRecipient = new SendMessageToRecipientService()

    await SendMessageToRecipient.run(to, messageData)
})

