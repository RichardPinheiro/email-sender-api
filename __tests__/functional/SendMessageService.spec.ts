import MongoMock from '../utils/MongoMock';

import SendMessageService from '../../src/services/SendMessageService';

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
    })

    it('should be able to create a new message', async () => {
        const sendMessage = new SendMessageService()

        const tags = await Tag.create([
            { title: 'Students' },          
            { title: 'Classe A' }            
        ])

        const tagsIds = tags.map(tag => tag._id)

        const messageData = {
            subject: 'Hello World',
            body: '<p>Just testing the email</p>',
            tags: tagsIds
        }

        await sendMessage.run(messageData)

        const message = await Message.findOne(messageData)

        expect(message).toBeTruthy()
    })
})