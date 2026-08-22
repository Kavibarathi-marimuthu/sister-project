import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ThumbsUp, Image, Plus } from 'lucide-react'
import { SectionHeader, Card } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'

const mockPosts = [
  {
    id: 'p1', author: 'ராமசாமி', village: 'திருவாரூர்', time: '2 மணி நேரம்',
    content: 'இந்த வருடம் CO 47 நெல் ரகம் மிகவும் நன்றாக வந்தது. ஏக்கருக்கு 55 மூட்டை கிடைத்தது! BLB நோய் இல்லாமல் நல்ல மகசூல்.',
    emoji: '🌾', likes: 24, comments: 8, badge: 'farmer_verified',
    image: null, crop: 'நெல்'
  },
  {
    id: 'p2', author: 'கோவிந்தசாமி', village: 'ஈரோடு', time: '5 மணி நேரம்',
    content: 'வாழை தோட்டத்தில் பனாமா வில்ட் நோய் பாதிப்பு தெரிகிறது. யாரோட வயலிலும் வந்ததா? சிகிச்சை முறை என்ன?',
    emoji: '🍌', likes: 12, comments: 15, badge: null,
    image: null, crop: 'வாழை'
  },
  {
    id: 'p3', author: 'முத்துராஜ்', village: 'நாமக்கல்', time: '1 நாள்',
    content: 'PM Fasal Bima Yojana விண்ணப்பம் நடக்கிறது. கடைசி நாள் மார்ச் 31. இன்னும் விண்ணப்பிக்காதவர்கள் உடனே செய்யுங்கள். நான் கடந்த வருடம் ₹45,000 பெற்றேன்.',
    emoji: '🏛️', likes: 67, comments: 22, badge: 'trusted_farmer',
    image: null, crop: null
  },
  {
    id: 'p4', author: 'செல்வி', village: 'திண்டுக்கல்', time: '2 நாள்',
    content: 'தக்காளி விலை ₹32/கிலோ ஆனது! நான் 500 கிலோ விற்பனைக்கு வைத்துள்ளேன். தாம்பரம் அல்லது கோயம்புத்தூர் எங்கு விற்பது நல்லது?',
    emoji: '🍅', likes: 31, comments: 19, badge: null,
    image: null, crop: 'தக்காளி'
  },
]

const badgeInfo = {
  farmer_verified: { label: 'சான்றிதழ் பெற்ற', cls: 'badge-green' },
  trusted_farmer: { label: 'நம்பகமான விவசாயி', cls: 'badge-blue' },
}

export default function CommunityScreen() {
  const { t, addToast } = useApp()
  const { farmerProfile } = useAuth()
  const [posts, setPosts] = useState(mockPosts)
  const [newPost, setNewPost] = useState('')
  const [liked, setLiked] = useState({})
  const [showNewPost, setShowNewPost] = useState(false)

  const toggleLike = (id) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }))
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (liked[id] ? -1 : 1) } : p))
  }

  const submitPost = () => {
    if (!newPost.trim()) return
    const post = {
      id: `p${Date.now()}`,
      author: farmerProfile?.name || 'விவசாயி',
      village: farmerProfile?.village || '',
      time: 'இப்போது',
      content: newPost,
      emoji: '🌱',
      likes: 0, comments: 0,
      badge: null, image: null, crop: null,
    }
    setPosts(prev => [post, ...prev])
    setNewPost('')
    setShowNewPost(false)
    addToast('கருத்து பதிவிடப்பட்டது! 🌾', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('விவசாயி சமூகம்', 'Farmer Community')}
        subtitle={t('தமிழ்நாடு விவசாயிகளுடன் இணையுங்கள்', 'Connect with Tamil Nadu farmers')}
        action={
          <button onClick={() => setShowNewPost(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={16} /> {t('பதிவிடு', 'Post')}
          </button>
        }
      />

      {/* New post form */}
      {showNewPost && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-forest-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
              {farmerProfile?.name?.[0] || '👨'}
            </div>
            <div className="flex-1">
              <textarea
                className="input-field resize-none h-24 text-sm tamil-text"
                placeholder="உங்கள் அனுபவம், கேள்வி அல்லது ஆலோசனை பகிருங்கள்..."
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={submitPost} className="btn-primary flex-1 text-sm">{t('பதிவிடு', 'Post')}</button>
                <button onClick={() => setShowNewPost(false)} className="btn-ghost">{t('ரத்து', 'Cancel')}</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Post feed */}
      <div className="flex flex-col gap-4">
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              {/* Post header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-forest-400 to-leaf-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {post.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-forest-800 dark:text-forest-200 tamil-text">{post.author}</span>
                    {post.badge && <span className={`${badgeInfo[post.badge]?.cls} text-xs`}>{badgeInfo[post.badge]?.label}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-soil-400 mt-0.5">
                    <span className="tamil-text">📍 {post.village}</span>
                    <span>·</span>
                    <span className="tamil-text">{post.time}</span>
                    {post.crop && <><span>·</span><span className="badge-green text-xs tamil-text">{post.emoji} {post.crop}</span></>}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-forest-800 dark:text-forest-200 tamil-text leading-relaxed">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-soil-50 dark:border-forest-900">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked[post.id] ? 'text-forest-600' : 'text-soil-400 hover:text-forest-600'}`}
                >
                  <ThumbsUp size={16} fill={liked[post.id] ? 'currentColor' : 'none'} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-soil-400 hover:text-forest-600 transition-colors">
                  <MessageCircle size={16} />
                  {post.comments}
                </button>
                <button
                  className="ml-auto text-xs text-forest-600 font-semibold"
                  onClick={() => addToast('பதில் அனுப்பப்பட்டது!', 'success')}
                >
                  பதில் சொல் →
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
