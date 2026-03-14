import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { lawyerService } from '../services/lawyerService';
import { FiSend, FiSearch, FiMessageSquare, FiSmile } from 'react-icons/fi';
import './Messages.css';

const Messages = ({ context = 'standalone' }) => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const lawyerId = searchParams.get('lawyerId');
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    const isDashboard = context === 'dashboard';

    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            const convs = await messageService.getConversations(user.uid);
            setConversations(convs);

            if (lawyerId && lawyerId !== user.uid) {
                const existingConv = convs.find(c => c.participants.includes(lawyerId));
                if (existingConv) {
                    setActiveConv(existingConv);
                } else {
                    const newConvId = messageService.getConversationId(user.uid, lawyerId);
                    const newConv = {
                        id: newConvId,
                        participants: [user.uid, lawyerId],
                        lastMessage: '',
                        isNew: true
                    };
                    setConversations(prev => [newConv, ...prev]);
                    setActiveConv(newConv);
                }
            }

            const participantsData = { ...participants };
            for (const conv of convs) {
                const otherPartyId = conv.participants.find(id => id !== user.uid);
                if (!participantsData[otherPartyId]) {
                    const lawyer = await lawyerService.getLawyerById(otherPartyId);
                    if (lawyer) {
                        participantsData[otherPartyId] = {
                            name: lawyer.name,
                            avatar: lawyer.avatar,
                            specialty: lawyer.specialty
                        };
                    } else {
                        participantsData[otherPartyId] = { name: 'Client' };
                    }
                }
            }
            setParticipants(participantsData);
            setLoading(false);
        };

        fetchConversations();
    }, [user, lawyerId]);

    useEffect(() => {
        if (!activeConv) return;

        const unsubscribe = messageService.subscribeToMessages(activeConv.id, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv) return;

        const receiverId = activeConv.participants.find(id => id !== user.uid);
        try {
            await messageService.sendMessage(user.uid, receiverId, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        return 'Evening';
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm.trim()) return true;
        const otherPartyId = conv.participants.find(id => id !== user.uid);
        const name = participants[otherPartyId]?.name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className={`msg-page ${isDashboard ? 'msg-page--dashboard' : ''}`}>
                <div className="msg-loading">
                    <div className="msg-loading__spinner"></div>
                    <p>Fetching your messages...</p>
                </div>
            </div>
        );
    }

    const content = (
        <div className={`msg-shell ${isDashboard ? 'msg-shell--dashboard' : ''}`}>
            {/* Sidebar */}
            <aside className="msg-sidebar">
                <div className="msg-sidebar__header">
                    <div className="msg-sidebar__title-wrap">
                        <h2 className="msg-sidebar__title">Messages</h2>
                        <span className="msg-sidebar__count">{conversations.length}</span>
                    </div>
                    <div className="msg-sidebar__search">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Find a conversation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="msg-sidebar__list">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => {
                            const otherPartyId = conv.participants.find(id => id !== user.uid);
                            const party = participants[otherPartyId] || { name: 'Loading...' };
                            const isActive = activeConv?.id === conv.id;
                            return (
                                <div
                                    key={conv.id}
                                    className={`msg-contact ${isActive ? 'msg-contact--active' : ''}`}
                                    onClick={() => setActiveConv(conv)}
                                >
                                    <div className="msg-contact__avatar" style={{ background: party.avatar ? 'none' : undefined }}>
                                        {party.avatar ? (
                                            <img src={party.avatar} alt={party.name} />
                                        ) : (
                                            (party.name || 'C')[0]
                                        )}
                                        <div className="msg-contact__status-dot"></div>
                                    </div>
                                    <div className="msg-contact__info">
                                        <div className="msg-contact__top">
                                            <span className="msg-contact__name">{party.name}</span>
                                            <span className="msg-contact__time">Just now</span>
                                        </div>
                                        <span className="msg-contact__preview">{conv.lastMessage || 'Start a new chat...'}</span>
                                    </div>
                                    {isActive && <div className="msg-contact__glow"></div>}
                                </div>
                            );
                        })
                    ) : (
                        <div className="msg-sidebar__empty">
                            <div className="msg-sidebar__empty-icon">💬</div>
                            <p>No chats found</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Chat Area */}
            <main className="msg-chat">
                {activeConv ? (
                    <>
                        <header className="msg-chat__header">
                            <div className="msg-chat__header-left">
                                <div className="msg-chat__header-avatar">
                                    {participants[activeConv.participants.find(id => id !== user.uid)]?.avatar ? (
                                        <img src={participants[activeConv.participants.find(id => id !== user.uid)].avatar} alt="Avatar" />
                                    ) : (
                                        (participants[activeConv.participants.find(id => id !== user.uid)]?.name || 'C')[0]
                                    )}
                                </div>
                                <div className="msg-chat__header-info">
                                    <h3>{participants[activeConv.participants.find(id => id !== user.uid)]?.name}</h3>
                                    <div className="msg-chat__header-status">
                                        <span className="msg-online-dot"></span>
                                        <span>Active Now</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="msg-chat__body">
                            {messages.length === 0 && (
                                <div className="msg-chat__start">
                                    <div className="msg-chat__start-visual">✨</div>
                                    <h3>Secure Legal Workspace</h3>
                                    <p>Your messages are encrypted and handled with the highest standard of client-attorney confidentiality.</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={msg.id} className={`msg-bubble-wrap ${msg.senderId === user.uid ? 'msg-bubble-wrap--sent' : 'msg-bubble-wrap--received'}`}>
                                    <div className={`msg-bubble ${msg.senderId === user.uid ? 'msg-bubble--sent' : 'msg-bubble--received'}`}>
                                        <div className="msg-bubble__text">{msg.text}</div>
                                        <div className="msg-bubble__time">
                                            {msg.createdAt?.seconds
                                                ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'sending...'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="msg-chat__composer" onSubmit={handleSendMessage}>
                            <button type="button" className="msg-chat__tool-btn">
                                <FiSmile />
                            </button>
                            <div className="msg-chat__input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Type your message here..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className={`msg-chat__send-btn ${newMessage.trim() ? 'msg-chat__send-btn--active' : ''}`}
                                    disabled={!newMessage.trim()}
                                >
                                    <FiSend />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="msg-chat__empty">
                        <div className="msg-chat__empty-content">
                            <div className="msg-chat__empty-graphic">
                                <span className="graphic-particle p1">⚖️</span>
                                <span className="graphic-particle p2">💬</span>
                                <span className="graphic-particle p3">📑</span>
                                <div className="graphic-center">🤝</div>
                            </div>
                            <h2>Good {getGreeting()}, {user?.displayName?.split(' ')[0]}</h2>
                            <p>Pick a conversation from the left to continue your legal consultations.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );

    if (isDashboard) return content;

    return (
        <div className="msg-page">
            {content}
        </div>
    );
};


export default Messages;
