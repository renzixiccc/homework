import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const Profile = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('published')

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchPosts()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'published') return post.status === 'published'
    if (activeTab === 'draft') return post.status === 'draft'
    return true
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>个人中心</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#6b7280'
          }}>
            {profile?.full_name?.[0] || profile?.username?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#1f2937' }}>
              {profile?.full_name || profile?.username || '用户'}
            </h2>
            <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>{user?.email}</p>
            {profile?.bio && (
              <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>{profile.bio}</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/create-post" className="btn btn-primary">
            写新文章
          </Link>
        </div>
      </div>

      <div className="card">
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('published')}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'published' ? '2px solid #3b82f6' : 'none',
                color: activeTab === 'published' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === 'published' ? '600' : '400'
              }}
            >
              已发布 ({posts.filter(p => p.status === 'published').length})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'draft' ? '2px solid #3b82f6' : 'none',
                color: activeTab === 'draft' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === 'draft' ? '600' : '400'
              }}
            >
              草稿 ({posts.filter(p => p.status === 'draft').length})
            </button>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>
              {activeTab === 'published' ? '还没有发布的文章' : '还没有草稿'}
            </p>
            <Link to="/create-post" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              开始写作
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPosts.map(post => (
              <div
                key={post.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                    <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                    创建于 {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
                    {post.published_at && (
                      <span style={{ marginLeft: '1rem' }}>
                        发布于 {format(new Date(post.published_at), 'yyyy年MM月dd日', { locale: zhCN })}
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
                    {post.excerpt || post.content.substring(0, 100) + '...'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/edit-post/${post.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    编辑
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile