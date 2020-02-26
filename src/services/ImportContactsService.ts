import { Readable } from 'stream';
import csvParse from 'csv-parse';

import Contact from '../../src/schemas/Contact'
import Tag from '../../src/schemas/Tag'

class ImportContactsService {
    public async run(contactFileStream: Readable, tags: string[]): Promise<void> {
        const parsers = csvParse({
            delimiter: ';'
        })

        const parseCsv = contactFileStream.pipe(parsers)

        const existentTags = await Tag.find({
            title: {
                $in: tags
            }
        }).lean()

        const existentTagsTitle = existentTags.map((tag: any) => tag.title)

        const newTagsData = tags
        .filter(tag => !existentTagsTitle.includes(tag))
        .map(tag => ({ title: tag}))
        
        const createdTags = await Tag.create(newTagsData)

        const tagsIds = createdTags.map(tag => tag._id)

        parseCsv.on('data', async line => {
            const [email] = line

            await Contact.findOneAndUpdate(
                { email },
                { $addToSet: { tags: tagsIds } },
                { upsert: true }
            )
        })

        await new Promise(resolve => parseCsv.on('end', resolve))
    }
}

export default ImportContactsService
