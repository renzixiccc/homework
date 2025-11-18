import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'

const PostDetail = () => {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  const fetchPost = async () => {
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
        .eq('id', id)
        .single()

      if (error) throw error
      setPost(data)

      // 增加浏览量
      await supabase
        .from('posts')
        .update({ view_count: data.view_count + 1 })
        .eq('id', id)
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
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
        .eq('post_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user || !commentContent.trim()) return

    setSubmittingComment(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: commentContent.trim(),
          author_id: user.id,
          post_id: id
        })

      if (error) throw error

      setCommentContent('')
      fetchComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container">
        <div className="card">
          <h2>文章不存在</h2>
          <Link to="/" className="btn btn-primary">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <article className="card">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
            {post.title}
          </h1>
          <div className="article-meta" style={{ fontSize: '1rem' }}>
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
            <span style={{ marginLeft: '1rem' }}>
              浏览量: {post.view_count}
            </span>
          </div>
        </header>

        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#374151' }}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {user?.id === post.author_id && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <Link to={`/edit-post/${post.id}`} className="btn btn-secondary">
              编辑文章
            </Link>
          </div>
        )}
      </article>

      {/* 评论区 */}
      <section style={{ marginTop: '3rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            评论 ({comments.length})
          </h3>

          {user ? (
            <form onSubmit={handleSubmitComment} style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="写下你的评论..."
                  rows={4}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submittingComment}
              >
                {submittingComment ? '发布中...' : '发表评论'}
              </button>
            </form>
          ) : (
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <p style={{ color: '#6b7280' }}>
                <Link to="/login" style={{ color: '#3b82f6' }}>登录</Link> 后发表评论
              </p>
            </div>
          )}

          <div>
            {comments.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>
                暂无评论，快来发表第一条评论吧！
              </p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>
                      {comment.author?.user_profiles?.full_name || comment.author?.user_profiles?.username || '匿名'}
                    </strong>
                    <span style={{ marginLeft: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {format(new Date(comment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                    </span>
                  </div>
                  <p style={{ margin: 0, lineHeight: '1.6' }}>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default PostDetail