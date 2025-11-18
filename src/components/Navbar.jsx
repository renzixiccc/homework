import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav>
      <div className="container">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <h2>博客平台</h2>
          </Link>
          
          <div className="nav-links">
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              首页
            </Link>
            <Link 
              to="/categories"
              className={isActive('/categories') ? 'active' : ''}
            >
              分类
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/create-post"
                  className={isActive('/create-post') ? 'active' : ''}
                >
                  写文章
                </Link>
                <Link 
                  to="/profile"
                  className={isActive('/profile') ? 'active' : ''}
                >
                  个人中心
                </Link>
                <button onClick={handleSignOut} className="btn btn-outline">
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className={isActive('/login') ? 'active' : ''}
                >
                  登录
                </Link>
                <Link 
                  to="/register"
                  className={isActive('/register') ? 'active' : ''}
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar