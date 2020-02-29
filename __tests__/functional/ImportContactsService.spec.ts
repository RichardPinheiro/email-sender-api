const { Readable } = require('stream');
import mongoose from 'mongoose'

import MongoMock from '../utils/MongoMock';

import ImportContactsService from '../../src/services/ImportContactsService';

import Contact from '../../src/schemas/Contact'
import Tag from '../../src/schemas/Tag'

describe('Import Contacts', () => {
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

    it('should not recreated contact that already exists', async () => {
        const contactFileStream = Readable.from([
            'richard@gmail.com\n',
            'test@gmail.com\n',
            'test2@gmail.com\n'
        ])

        const impotContacts = new ImportContactsService()

        const tag = await Tag.create({ title: 'Students' })

        await Contact.create({ email: 'richard@gmail.com', tags: [tag._id] })

        await impotContacts.run(contactFileStream, ['Class A'])

        const contacts = await Contact.find({
            email: 'richard@gmail.com'
        }).populate('tags').lean()

        expect(contacts.length).toBe(1)
        expect(contacts[0].tags).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: 'Students' }),
                expect.objectContaining({ title: 'Class A' })
            ])
        )
    
    })
})
