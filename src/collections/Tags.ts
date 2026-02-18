import { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tag',
  fields: [
    {
      name: 'tag',
      type: 'text',
    },
  ],
}
