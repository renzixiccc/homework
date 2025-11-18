import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const CategoryDetail = () => {
  const { slug } = useParams()
  const { supabase } = useSupabase()
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchCategory()
      fetchPosts()
    }
  }, [slug])

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      setCategory(data)
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }

  const fetchPosts = async () => {
    try {
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

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container">
        <div className="card">
          <h2>分类不存在</h2>
          <Link to="/categories" className="btn btn-primary">返回分类列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1f2937' }}>{category.name}</h1>
        {category.description && (
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {category.description}
          </p>
        )}
        <p style={{ color: '#3b82f6', marginTop: '1rem' }}>
          共 {posts.length} 篇文章
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>该分类下暂无文章</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              浏览其他文章
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <article key={post.id} className="article-card">
              <div className="article-content">
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
                  <h3 className="article-title">{post.title}</h3>
                </Link>
                <div className="article-meta">
                  <span>
                    作者: {post.author?.user_profiles?.full_name || post.author?.user_profiles?.username || '匿名'}
                  </span>
                  <span style={{ marginLeft: '1rem' }}>
                    {post.published_at && format(new Date(post.published_at), 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                </div>
                <p className="article-excerpt">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/post/${post.id}`} className="btn btn-outline">
                    阅读全文
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryDetail