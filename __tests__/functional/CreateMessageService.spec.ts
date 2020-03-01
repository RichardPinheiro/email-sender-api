import MongoMock from '../utils/MongoMock';
import QueueMock from '../utils/QueueMock';

import CreateMessageService from '../../src/services/CreateMessageService';

import Contact from '../../src/schemas/Contact'
import Tag from '../../src/schemas/Tag'
import Message from '../../src/schemas/Message';

describe('Send Message', () => {
    beforeAll(async () => {
        await MongoMock.connect()
    })

    afterAll(async () => {
        await MongoMock.disconnect()
    })

    beforeEach(async () => {
        await Tag.deleteMany({})
        await Contact.deleteMany({})
        await Message.deleteMany({})
    })

    it('should be able to create a new message', async () => {
        const sendMessage = new CreateMessageService()

        const tags = await Tag.create([
            { title: 'Students' },          
            { title: 'Classe A' }            
        ])

        const tagsIds = tags.map(tag => tag._id)

        const messageData = {
            subject: 'Hello World',
            body: '<p>Just testing the email</p>'
        }

        await sendMessage.run(messageData, tagsIds)

        const message = await Message.findOne(messageData)

        expect(message).toBeTruthy()
    })

    it('should created a redis register for each recipients email', async () => {
        const sendMessage = new CreateMessageService()

        const tags = await Tag.create([
            { title: 'Students' },          
            { title: 'Classe A' }            
        ])

        const tagsIds = tags.map(tag => tag._id)

        const contacts = [
            { email: 'richard@gmail.com', tags: tagsIds },
            { email: 'test@gmail.com', tags: tagsIds },
            { email: 'test2@gmail.com', tags: tagsIds }
        ]

        await Contact.create(contacts)

        const messageData = {
            subject: 'Hello World',
            body: '<p>Just testing the email</p>'
        }

        await sendMessage.run(messageData, tagsIds)

        expect(QueueMock.add).toHaveBeenCalledWith({
            to: contacts[0].email,
            messageData
        })

        expect(QueueMock.add).toHaveBeenCalledWith({
            to: contacts[1].email,
            messageData
        })

        expect(QueueMock.add).toHaveBeenCalledWith({
            to: contacts[1].email,
            messageData
        })

    })
})