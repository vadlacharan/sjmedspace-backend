//@ts-nocheck
import { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  access: {
    read: () => true,
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
        const blogId = req.routeParams.id || ''
        const userId = req.user.id
        const payload = req.payload

        if (!blogId) {
          return Response.json({ error: 'Missing ID' }, { status: 400 })
        }

        // 1️⃣ Fetch document
        const doc = await payload.findByID({
          collection: 'blogs',
          id: blogId,
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
          collection: 'blogs',
          id: blogId,
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
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const publicationId = String(req.routeParams.id)

        const body = await req.json().catch(() => null)
        const text = body?.text

        if (typeof text !== 'string' || !text.trim()) {
          return Response.json({ error: 'Valid comment text required' }, { status: 400 })
        }

        const doc = await req.payload.findByID({
          collection: 'blogs',
          id: publicationId,
          depth: 1,
        })

        if (!doc) {
          return Response.json({ error: 'Not found' }, { status: 404 })
        }

        const updatedDoc = await req.payload.update({
          collection: 'blogs',
          id: publicationId,
          data: {
            commentedBy: [
              ...(doc.commentedBy || []),
              {
                commentValue: text.trim(),
                user: req.user.id,
              },
            ],
          },
          depth: 1, // important so user is populated
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
      name: 'content',
      type: 'richText',
    },
    {
      name: 'likedBy',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
    },
    {
      name: 'likeCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'commentedBy',
      type: 'array',
      fields: [
        {
          name: 'commentValue',
          type: 'textarea',
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
    },
  ],
}
