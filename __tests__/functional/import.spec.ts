const { Readable } = require('stream');
import mongoose from 'mongoose'

import ImportContactsService from '../../src/services/ImportContactsService';

import Contact from '../../src/schemas/Contact'
import Tag from '../../src/schemas/Tag'

describe('Import', () => {
    beforeAll(async () => {
        if (!process.env.MONGO_URL) {
            throw new Error('MongoDB server not initialized');
        }

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useCreateIndex: true
        })
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

    beforeEach(async () => {
        await Tag.deleteMany({})
        await Contact.deleteMany({})
    })

    it('should be able to import new contacts', async () => {
        const contactFileStream = Readable.from([
            'richard@gmail.com\n',
            'test@gmail.com\n',
            'test2@gmail.com\n'
        ])

        const impotContacts = new ImportContactsService()

        await impotContacts.run(contactFileStream, ['Students', 'Class A'])

        const createdTags = await Tag.find({}).lean()

        expect(createdTags).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: 'Students' }),
                expect.objectContaining({ title: 'Class A' })
            ])
        )
        
        const createdTagsIds = createdTags.map((tag: any) => tag._id)

        const createdContacts = await Contact.find({}).lean()

        expect(createdContacts).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    email: 'richard@gmail.com',
                    tags: createdTagsIds
                }),
                expect.objectContaining({
                    email: 'test@gmail.com',
                    tags: createdTagsIds
                }),
                expect.objectContaining({
                    email: 'test2@gmail.com',
                    tags: createdTagsIds
                })
            ])
        )
    })

    it('should not recreate tags that already exists', async () => {
        const contactFileStream = Readable.from([
            'richard@gmail.com\n',
            'test@gmail.com\n',
            'test2@gmail.com\n'
        ])

        const impotContacts = new ImportContactsService()

        await Tag.create({ title: 'Students' })

        await impotContacts.run(contactFileStream, ['Students', 'Class A'])

        const createdTags = await Tag.find({}).lean()

        expect(createdTags).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: 'Students' }),
                expect.objectContaining({ title: 'Class A' })
            ])
        )
    })
})
