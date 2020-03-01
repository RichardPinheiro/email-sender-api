import Message, { MessageModel } from '../schemas/Message';
import Contact from '../schemas/Contact';

import MailQueue from '../queues/MailQueue';

import MessageData from './structures/MessageData';

class CreateMessageService {
    public async run(messageData: MessageData, tags: string[]): Promise<MessageModel> {
        const message = await Message.create(messageData)

        const recipients = await Contact.find({
            tags: {
                $in: tags
            }
        })

        await Promise.all(
            recipients.map(recipient => {
                return MailQueue.add({
                    to: recipient.email,
                    messageData
                })
            })
        )

        return message
    }
}

export default CreateMessageService