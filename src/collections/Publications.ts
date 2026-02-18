//@ts-nocheck
import { CollectionConfig } from 'payload'

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  endpoints: [
    {
      path: '/:id/toggle-like',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        //@ts-ignore
        const publicationId = req.routeParams.id || ''
        const userId = req.user.id
        const payload = req.payload

        if (!publicationId) {
          return Response.json({ error: 'Missing ID' }, { status: 400 })
        }

        // 1️⃣ Fetch document
        const doc = await payload.findByID({
          collection: 'publications',
          id: publicationId,
        })

        if (!doc) {
          return Response.json({ error: 'Not found' }, { status: 404 })
        }

        const existingLikes = doc.likedBy || []

        // helper to normalize relationship
        const getUserId = (like: any) => (typeof like.user === 'object' ? like.user.id : like.user)

        const alreadyLiked = existingLikes.some((like: any) => getUserId(like) === userId)

        const updatedLikes = alreadyLiked
          ? existingLikes.filter((like: any) => getUserId(like) !== userId)
          : [...existingLikes, { user: userId }]

        // 2️⃣ Update document
        const updatedDoc = await payload.update({
          collection: 'publications',
          id: publicationId,
          data: {
            likedBy: updatedLikes,
            likeCount: updatedLikes.length,
          },
        })

        return Response.json(updatedDoc)
      },
    },

    {
      path: '/:id/add-comment',
      method: 'post',
      handler: async (req) => {
        if (!req.user || !req.routeParams) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const publicationId = String(req.routeParams.id)
        const { text } = await req.json()
        const userId = req.user.id
        const payload = req.payload

        if (!text || !text.trim()) {
          return Response.json({ error: 'Comment text is required' }, { status: 400 })
        }

        const doc = await payload.findByID({
          collection: 'publications',
          id: publicationId,
        })

        if (!doc) {
          return Response.json({ error: 'Not found' }, { status: 404 })
        }

        const existingComments = doc.commentedBy || []

        const updatedDoc = await req.payload.update({
          collection: 'publications',
          id: publicationId,
          data: {
            commentedBy: [
              ...existingComments,
              {
                commentValue: text,
                user: userId,
              },
            ],
          },
        })

        return Response.json(updatedDoc)
      },
    },
  ],
  fields: [
    {
      access: {
        create: ({ req }) => {
          if (!req || !req.user) {
            return false
          }
          return req.user.role === 'admin'
        },
        update: ({ req }) => {
          if (!req || !req.user) {
            return false
          }

          return req.user.role === 'admin'
        },
      },
      name: 'title',
      type: 'text',
    },
    {
      access: {
        create: ({ req }) => {
          if (!req || !req.user) {
            return false
          }
          return req.user.role === 'admin'
        },
        update: ({ req }) => {
          if (!req || !req.user) {
            return false
          }

          return req.user.role === 'admin'
        },
      },
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      access: {
        create: ({ req }) => {
          if (!req || !req.user) {
            return false
          }
          return req.user.role === 'admin'
        },
        update: ({ req }) => {
          if (!req || !req.user) {
            return false
          }

          return req.user.role === 'admin'
        },
      },
      name: 'likeCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'commentedBy',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'commentValue',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'tag',
      type: 'relationship',
      relationTo: 'tag',
      hasMany: true,
    },

    {
      name: 'likedBy',
      type: 'array',
      hooks: {
        beforeChange: [],
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
    },
  ],
}
