import { supabase } from './supabase'

// 用户 profile 相关
export const createUserProfile = async ({ id, email, fullName, username }) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id,
      email,
      full_name: fullName || null,
      username: username || null
    })
    .select()
    .single()

  return { data, error }
}

export const getUserProfile = async (id) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

export const updateUserProfile = async (id, payload) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// 分类相关
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return { data, error }
}

export const getCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  return { data, error }
}

// 文章相关
export const getPublishedPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id (
        id,
        user_profiles (
          username,
          full_name,
          avatar_url
        )
      ),
      category:category_id (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return { data, error }
}

export const getPostById = async (id) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id (
        id,
        user_profiles (
          username,
          full_name,
          avatar_url
        )
      ),
      category:category_id (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

export const createPost = async (payload) => {
  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select()
    .single()

  return { data, error }
}

export const updatePost = async (id, payload) => {
  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export const deletePost = async (id) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  return { error }
}

export const getPublishedPostsByCategorySlug = async (slug) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id (
        id,
        user_profiles (
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('status', 'published')
    .eq('category_id',
      `(select id from categories where slug = '${slug}')`
    )
    .order('published_at', { ascending: false })

  return { data, error }
}

// 评论相关
export const getCommentsByPostId = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:author_id (
        id,
        user_profiles (
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  return { data, error }
}

export const createComment = async (payload) => {
  const { data, error } = await supabase
    .from('comments')
    .insert(payload)
    .select()
    .single()

  return { data, error }
}

export const deleteComment = async (id) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  return { error }
}


