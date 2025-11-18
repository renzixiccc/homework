import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'

const EditPost = () => {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft'
  })

  useEffect(() => {
    fetchPost()
    fetchCategories()
  }, [id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // 检查是否是作者
      if (data.author_id !== user?.id) {
        navigate('/')
        return
      }

      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        category_id: data.category_id || '',
        status: data.status
      })
    } catch (error) {
      console.error('Error fetching post:', error)
      navigate('/')
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const postData = {
        ...formData,
        category_id: formData.category_id || null,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      }

      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id)

      if (error) throw error

      navigate(`/post/${id}`)
    } catch (error) {
      console.error('Error updating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/')
    } catch (error) {
      console.error('Error deleting post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>编辑文章</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">文章标题 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              placeholder="请输入文章标题"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">URL 别名</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="文章的URL别名"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">文章摘要</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="简短描述文章内容（可选）"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id">分类</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">选择分类（可选）</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">文章内容 *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              required
              placeholder="支持 Markdown 格式"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">发布状态</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '更新中...' : '更新文章'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-secondary"
              disabled={loading}
              style={{ backgroundColor: '#ef4444' }}
            >
              {loading ? '删除中...' : '删除文章'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPost