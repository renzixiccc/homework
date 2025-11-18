import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const Home = () => {
  const { supabase } = useSupabase()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

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
          ),
          category:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="hero-section" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#1f2937' }}>
          欢迎来到博客平台
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>
          分享知识，记录生活，连接世界
        </p>
        <Link to="/create-post" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
          开始写作
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '3rem' }}>
        <div>
          <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>最新文章</h2>
          {posts.length === 0 ? (
            <div className="card">
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                暂无文章，快来发表第一篇吧！
              </p>
            </div>
          ) : (
            posts.map(post => (
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
                    {post.category && (
                      <span style={{ marginLeft: '1rem' }}>
                        分类: <Link to={`/category/${post.category.slug}`} style={{ color: '#3b82f6' }}>
                          {post.category.name}
                        </Link>
                      </span>
                    )}
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
            ))
          )}
        </div>

        <div>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>文章分类</h3>
            {categories.length === 0 ? (
              <p style={{ color: '#6b7280' }}>暂无分类</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    style={{
                      padding: '0.5rem',
                      textDecoration: 'none',
                      color: '#4b5563',
                      borderRadius: '4px',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home