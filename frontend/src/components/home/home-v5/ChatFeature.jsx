'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { getPropertyHref } from '@/utils/propertyRoute'
import { resolveImageSrc } from '@/utils/resolveImage'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Looking for properties in Gurgaon? I can help you explore projects, prices, builders and investment opportunities.',
}

function PropertyCard({ property }) {
  return (
    <div className='chat-feature__property-card mb10'>
      <div className='d-flex align-items-center'>
        <div className='flex-shrink-0' style={{ width: '72px', height: '72px', overflow: 'hidden', borderRadius: '10px' }}>
          <Image
            width={72}
            height={72}
            className='w-100 h-100 cover'
            src={resolveImageSrc(property.image, '/images/listings/g1-1.jpg')}
            alt={property.title || 'Property image'}
          />
        </div>
        <div className='flex-grow-1 ml15'>
          <h6 className='list-title fz14 mb0 text-truncate' style={{ maxWidth: '260px' }}>
            {property.title}
          </h6>
          <p className='list-text fz12 mb5 text-muted text-truncate' style={{ maxWidth: '260px' }}>{property.location}</p>
          <div className='list-meta d-flex align-items-center fz11 text-muted'>
            <span className='flaticon-bed mr5' /> {property.bed} bed
            <span className='flaticon-expand ml10 mr5' /> {property.sqft} sqft
          </div>
        </div>
      </div>
      <div className='mt10 pt10 d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid rgba(24,26,32,0.07)' }}>
        {property.tag ? (
          <span className='badge fz10' style={{ background: 'rgba(255,56,92,0.09)', color: '#ff385c', borderRadius: '999px', padding: '4px 10px', fontWeight: 700 }}>{property.tag}</span>
        ) : <span />}
        <Link href={getPropertyHref(property)} target='_blank' className='chat-feature__property-link fz13 fw600'>
          View Details <i className='fal fa-arrow-right-long ml5' />
        </Link>
      </div>
    </div>
  )
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const urlPattern = /(https?:\/\/[^\s]+)/g

  const renderInlineLinks = (text = '') =>
    text.split(urlPattern).map((part, index) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <Link key={`${part}-${index}`} href={part} target='_blank' rel='noopener noreferrer' className='chat-feature__property-link fw600'>
            {part}
          </Link>
        )
      }
      return <React.Fragment key={index}>{part}</React.Fragment>
    })

  const getNextUrl = (lines, startIndex) => {
    for (let index = startIndex + 1; index < lines.length; index += 1) {
      const line = lines[index].trim()
      if (!line) continue
      const match = line.match(/(?:URL:\s*)?(https?:\/\/\S+)/i)
      return match?.[1] || ''
    }
    return ''
  }

  const renderMessageContent = (content = '') => {
    const lines = content.split('\n')
    const blocks = []
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      const propertyMatch = trimmedLine.match(/^-\s+(.+)$/)
      const urlMatch = trimmedLine.match(/^(URL:\s*)?(https?:\/\/\S+)$/i)
      if (!trimmedLine) { blocks.push(<br key={`blank-${index}`} />); return }
      if (propertyMatch && getNextUrl(lines, index)) {
        const propertyUrl = getNextUrl(lines, index)
        blocks.push(
          <div key={`property-${index}`} className='mt10'>
            <span>- </span>
            <Link href={propertyUrl} target='_blank' rel='noopener noreferrer' className='chat-feature__property-link'>
              <strong>{propertyMatch[1].trim()}</strong>
            </Link>
          </div>
        )
        return
      }
      if (urlMatch) {
        const url = urlMatch[2]
        const previousLine = lines[index - 1]?.trim() || ''
        if (/^-\s+(.+)$/.test(previousLine)) return
        blocks.push(
          <div key={`url-${index}`} className='pl15'>
            <Link href={url} target='_blank' rel='noopener noreferrer' className='chat-feature__property-link'>{url}</Link>
          </div>
        )
        return
      }
      if (propertyMatch) { blocks.push(<div key={`bullet-${index}`}>{renderInlineLinks(trimmedLine)}</div>); return }
      blocks.push(<div key={`line-${index}`}>{renderInlineLinks(line)}</div>)
    })
    return blocks
  }

  return (
    <div className={`chat-feature__bubble-container${isUser ? ' chat-feature__bubble-container--user' : ''}`}>
      <div className={`chat-feature__bubble${isUser ? ' chat-feature__bubble--user' : ''}`}>
        <div className='mb0'>{renderMessageContent(message.content)}</div>
        {!isUser && message.properties && message.properties.length > 0 && (
          <div className='chat-feature__properties-grid mt15'>
            {message.properties.map((prop, idx) => <PropertyCard key={idx} property={prop} />)}
          </div>
        )}
        {!isUser && message.cta && (
          <div className='mt15'>
            {message.cta.href
              ? <Link href={message.cta.href} className='ud-btn w-100 fz13 py-2'>{message.cta.text}</Link>
              : <button className='ud-btn w-100 fz13 py-2'>{message.cta}</button>
            }
          </div>
        )}
      </div>
    </div>
  )
}

const ChatFeature = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async (text) => {
    const messageText = text || inputValue
    if (!messageText.trim() || isLoading) return
    const userMsg = { role: 'user', content: messageText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    try {
      const history = newMessages.map(({ role, content }) => ({ role, content }))
      const response = await axios.post('/api/chat', { message: messageText, history })
      const { reply, properties, suggestions, cta } = response.data
      setMessages(prev => [...prev, { role: 'assistant', content: reply, properties, suggestions, cta }])
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => handleSend(suggestion)

  const lastMessage = messages[messages.length - 1]
  const suggestions = lastMessage?.suggestions || [
    'Best sectors to invest in Gurgaon',
    '3BHK under ₹2 Cr',
    'New launches near Dwarka Expressway',
  ]

  return (
    <section className='chat-feature cf-premium pb80 pb30-md'>
      <div className='container'>

        {/* ── Centered section header ── */}
        <div className='cf-premium__header' data-aos='fade-up'>
          
          <h2 className='cf-premium__title'>
            Your AI Guide to{' '}
            <span className='cf-premium__title-accent'>Gurgaon Real Estate</span>
          </h2>
          <p className='cf-premium__subtitle'>
            Explore Gurgaon's property market with instant answers about projects,
            prices, locations, and investment opportunities.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className='row align-items-center'>

          {/* Left: text + features */}
          <div
            className='col-lg-5 cf-premium__left order-1 order-lg-1'
            data-aos='fade-right'
            suppressHydrationWarning
          >
            {/* Stats */}
            <div className='cf-premium__stats'>
              <div className='cf-premium__stat'>
                <span className='cf-premium__stat-num'>500+</span>
                <span className='cf-premium__stat-label'>Live Projects</span>
              </div>
              <div className='cf-premium__stat'>
                <span className='cf-premium__stat-num'>₹45L</span>
                <span className='cf-premium__stat-label'>Avg Price</span>
              </div>
              <div className='cf-premium__stat'>
                <span className='cf-premium__stat-num'>24/7</span>
                <span className='cf-premium__stat-label'>AI Support</span>
              </div>
            </div>

            {/* Feature list */}
            <ul className='cf-premium__features'>
              <li className='cf-premium__feature'>
                <div className='cf-premium__feature-icon'>
                  <i className='fal fa-search-location' />
                </div>
                <div>
                  <div className='cf-premium__feature-title'>Hyper-local Market Data</div>
                  <div className='cf-premium__feature-desc'>Sector-wise pricing, trends, and developer track records — all in one place.</div>
                </div>
              </li>
              <li className='cf-premium__feature'>
                <div className='cf-premium__feature-icon'>
                  <i className='fal fa-chart-line' />
                </div>
                <div>
                  <div className='cf-premium__feature-title'>Investment Intelligence</div>
                  <div className='cf-premium__feature-desc'>Compare ROI, upcoming infrastructure impact, and appreciation potential.</div>
                </div>
              </li>
              <li className='cf-premium__feature'>
                <div className='cf-premium__feature-icon'>
                  <i className='fal fa-bolt' />
                </div>
                <div>
                  <div className='cf-premium__feature-title'>Instant Expert Answers</div>
                  <div className='cf-premium__feature-desc'>Ask anything — from RERA status to floor plans — and get answers in seconds.</div>
                </div>
              </li>
            </ul>

            <button
              onClick={() => handleSuggestionClick('Tell me about hot investment spots in Gurgaon')}
              className='cf-premium__cta'
            >
              <span>Start AI Property Search</span>
              <i className='fal fa-arrow-right-long' />
            </button>
          </div>

          {/* Right: chat card */}
          <div
            className='col-lg-7 order-2 order-lg-2'
            data-aos='fade-left'
            suppressHydrationWarning
          >
            <div className='cf-premium__chat-wrap'>

              {/* Floating trust badge */}
              <div className='cf-premium__trust-badge'>
                <div className='cf-premium__trust-badge-icon'>
                  <i className='fal fa-shield-check' />
                </div>
                <div>
                  <div className='cf-premium__trust-badge-label'>RERA Verified</div>
                  <div className='cf-premium__trust-badge-sub'>All listings checked</div>
                </div>
              </div>

              <div className='cf-premium__chat-card d-flex flex-column' style={{ height: '78vh', overflow: 'hidden' }}>

                {/* Mac-style header */}
                <div className='cf-premium__chat-header'>
                  <div className='cf-premium__chat-header-dots'>
                    <span className='cf-premium__chat-header-dot' />
                    <span className='cf-premium__chat-header-dot' />
                    <span className='cf-premium__chat-header-dot' />
                  </div>
                  <div className='cf-premium__chat-header-center'>
                    <div className='cf-premium__chat-header-avatar'>AI</div>
                    <span className='cf-premium__chat-header-name'>Jameenwallah AI</span>
                  </div>
                  <div className='cf-premium__chat-header-badge'>
                    <span className='cf-premium__chat-header-badge-dot' />
                    LIVE
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={scrollRef}
                  className='chat-feature__bubbles flex-grow-1 overflow-auto'
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {messages.map((msg, i) => (
                    <ChatBubble key={i} message={msg} />
                  ))}
                  {isLoading && (
                    <div className='chat-feature__typing mt10' aria-live='polite'>
                      <span className='chat-feature__typing-text'>AI is thinking</span>
                      <span className='chat-feature__typing-dots'>
                        <span className='chat-feature__typing-dot' />
                        <span className='chat-feature__typing-dot' />
                        <span className='chat-feature__typing-dot' />
                      </span>
                    </div>
                  )}
                </div>

                {/* Suggestion strip */}
                {suggestions && suggestions.length > 0 && (
                  <div className='chat-feature__suggest-strip'>
                    <div>
                      {suggestions.map((label, i) => (
                        <button
                          key={i}
                          type='button'
                          onClick={() => handleSuggestionClick(label)}
                          disabled={isLoading}
                          className='chat-feature__suggest-btn'
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className='chat-feature__input-wrap'>
                  <form onSubmit={(e) => { e.preventDefault(); handleSend() }}>
                    <input
                      type='text'
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isLoading}
                      className='chat-feature__input'
                      placeholder='Ask about projects, prices, sectors…'
                      aria-label='Ask a question'
                    />
                    <button
                      type='submit'
                      disabled={isLoading || !inputValue.trim()}
                      className='chat-feature__send-btn'
                      aria-label='Send'
                    >
                      Send
                      <i className='fal fa-arrow-right-long' />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ChatFeature
