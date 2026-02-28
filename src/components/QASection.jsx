import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCommentDots, FaGavel, FaThumbsUp, FaCheckCircle } from 'react-icons/fa';
import { FiMessageCircle, FiArrowRight, FiSend } from 'react-icons/fi';
import { qaService } from '../services/qaService';
import { lawyerService } from '../services/lawyerService';
import { useAuth } from '../context/AuthContext';
import './QASection.css';

const QASection = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lawyerProfile, setLawyerProfile] = useState(null);
    const [answeringId, setAnsweringId] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchQuestions = async () => {
        setLoading(true);
        const data = await qaService.getQuestions();
        setQuestions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestions();

        // Check if current user is a lawyer
        const checkLawyerStatus = async () => {
            if (user) {
                const lawyers = await lawyerService.getAllLawyers();
                const matched = lawyers.find(l => l.userId === user.uid);
                if (matched) setLawyerProfile(matched);
            }
        };
        checkLawyerStatus();
    }, [user]);

    const handleAnswerSubmit = async (questionId) => {
        if (!answerText.trim() || !lawyerProfile) return;

        setSubmitting(true);
        try {
            await qaService.addAnswer(questionId, {
                lawyerId: lawyerProfile.id,
                lawyerName: lawyerProfile.name,
                lawyerColor: lawyerProfile.color || '#1a73e8',
                lawyerSpecialty: lawyerProfile.specialty,
                text: answerText
            });
            setAnswerText('');
            setAnsweringId(null);
            fetchQuestions(); // Refresh
        } catch (error) {
            alert("Failed to submit answer. Please try again.");
        }
        setSubmitting(false);
    };

    return (
        <section className="qa-section section" id="ask">
            <div className="container">
                <div className="qa-section__layout">
                    <div className="qa-section__left">
                        <h2 className="section-title">Ask a Lawyer — For Free</h2>
                        <p className="section-subtitle">
                            Get free legal advice from verified attorneys. Ask any question and receive answers within hours.
                        </p>
                        <div className="qa-section__ask-box">
                            <FiMessageCircle className="qa-section__ask-icon" />
                            <input
                                type="text"
                                placeholder="Type your legal question here..."
                                className="qa-section__ask-input"
                                onFocus={() => navigate('/ask')}
                            />
                            <button className="btn btn-primary" onClick={() => navigate('/ask')}>Ask Now</button>
                        </div>
                        <div className="qa-section__ask-stats">
                            <span><strong>1k+</strong> local lawyers</span>
                            <span><strong>97%</strong> success rate</span>
                        </div>
                    </div>

                    <div className="qa-section__right">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>Loading questions...</div>
                        ) : questions.length > 0 ? (
                            questions.map((q) => (
                                <div key={q.id} className="qa-card">
                                    <div className="qa-card__header">
                                        <span className="qa-card__category" style={{
                                            background: `${q.topAnswer?.lawyerColor || '#666'}15`,
                                            color: q.topAnswer?.lawyerColor || '#666'
                                        }}>
                                            {q.category}
                                        </span>
                                        <span className="qa-card__time">
                                            {q.createdAt?.seconds ? new Date(q.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                    <h4 className="qa-card__question">{q.question}</h4>

                                    {q.topAnswer ? (
                                        <div className="qa-card__answer">
                                            <div className="qa-card__answer-avatar" style={{ background: q.topAnswer.lawyerColor }}>
                                                {q.topAnswer.lawyerName.charAt(0)}
                                            </div>
                                            <div className="qa-card__answer-content">
                                                <div className="qa-card__lawyer-meta">
                                                    <span className="qa-card__lawyer">{q.topAnswer.lawyerName}</span>
                                                    <span className="qa-card__badge"><FaCheckCircle /> Attorney</span>
                                                </div>
                                                <p className="qa-card__answer-text">{q.topAnswer.text}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="qa-card__no-answer">
                                            <p>Waiting for attorney answer...</p>
                                            {lawyerProfile && answeringId !== q.id && (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ marginTop: '10px' }}
                                                    onClick={() => setAnsweringId(q.id)}
                                                >
                                                    Respond as Attorney
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {answeringId === q.id && (
                                        <div className="qa-card__answer-form">
                                            <textarea
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                placeholder="Write your professional legal advice..."
                                                rows="4"
                                            />
                                            <div className="qa-card__form-actions">
                                                <button className="btn btn-sm" onClick={() => setAnsweringId(null)}>Cancel</button>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAnswerSubmit(q.id)}
                                                    disabled={submitting || !answerText.trim()}
                                                >
                                                    {submitting ? 'Posting...' : 'Post Answer'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="qa-card__footer">
                                        <span className="qa-card__stat"><FaCommentDots /> {q.answersCount || 0} answers</span>
                                        <span className="qa-card__stat"><FaThumbsUp /> {q.likes || 0} helpful</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>No questions yet. Be the first to ask!</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QASection;
