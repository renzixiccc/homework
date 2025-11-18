import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'

const CreatePost = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const buildPostPayload = (statusOverride) => {
    const status = statusOverride || formData.status
    return {
      ...formData,
      status,
      category_id: formData.category_id || null,
      author_id: user.id,
      published_at: status === 'published' ? new Date().toISOString() : null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    try {
      const postData = buildPostPayload()

      const { error: insertError } = await supabase
        .from('posts')
        .insert(postData)

      if (insertError) throw insertError

      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      setError(error.message || '创建文章失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    try {
      const postData = buildPostPayload('draft')

      const { error: insertError } = await supabase
        .from('posts')
        .insert(postData)

      if (insertError) throw insertError

      navigate('/profile')
    } catch (error) {
      console.error('Error saving draft:', error)
      setError(error.message || '保存草稿失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>创建新文章</h1>
        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '6px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}
        
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
              placeholder="文章的URL别名（自动生成）"
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
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存草稿'}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '发布中...' : '发布文章'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost