import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/db'

const Categories = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await getCategories()
      if (err) throw err
      
      // 获取每个分类的文章数
      const categoriesWithCount = await Promise.all(
        (data || []).map(async (cat) => {
          const { count, error: countErr } = await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'published')
          
          return {
            ...cat,
            postsCount: countErr ? 0 : (count || 0)
          }
        })
      )
      
      setCategories(categoriesWithCount)
      setError('')
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('加载分类失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
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
    setError('')

    if (!formData.name.trim()) {
      setError('分类名称不能为空')
      return
    }

    try {
      if (editingId) {
        // 更新分类
        const { error: err } = await updateCategory(editingId, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null
        })
        if (err) throw err
      } else {
        // 创建新分类
        const { error: err } = await createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null
        })
        if (err) throw err
      }

      setFormData({ name: '', slug: '', description: '' })
      setEditingId(null)
      setShowForm(false)
      await fetchCategories()
    } catch (err) {
      console.error('Error saving category:', err)
      setError(err.message || '保存分类失败，请稍后再试')
    }
  }

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    })
    setEditingId(category.id)
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个分类吗？')) return

    try {
      setError('')
      const { error: err } = await deleteCategory(id)
      if (err) throw err
      await fetchCategories()
    } catch (err) {
      console.error('Error deleting category:', err)
      setError(err.message || '删除分类失败，请稍后再试')
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', slug: '', description: '' })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>文章分类管理</h1>
          {user && (
            <button
              onClick={() => {
                if (showForm) {
                  handleCancel()
                } else {
                  setShowForm(true)
                  setEditingId(null)
                }
              }}
              className="btn btn-primary"
              style={{ marginBottom: 0 }}
            >
              {showForm ? '取消' : '+ 新建分类'}
            </button>
          )}
        </div>

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

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div className="form-group">
              <label htmlFor="name">分类名称 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="请输入分类名称"
                required
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
                placeholder="分类的 URL 别名（自动生成）"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">分类描述</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="分类的简短描述（可选）"
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? '更新分类' : '创建分类'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                取消
              </button>
            </div>
          </form>
        )}

        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>暂无分类</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>分类名称</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>URL 别名</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>文章数</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>描述</th>
                  {user && <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>操作</th>}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link
                        to={`/category/${category.slug}`}
                        style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>{category.slug}</td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>{category.postsCount}</td>
                    <td style={{ padding: '1rem', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {category.description || '-'}
                    </td>
                    {user && (
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(category)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories