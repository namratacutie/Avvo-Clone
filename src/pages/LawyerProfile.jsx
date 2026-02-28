import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lawyerService } from '../services/lawyerService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiStar, FiCheckCircle, FiPhone, FiMail, FiGlobe, FiCalendar, FiMessageSquare, FiUser } from 'react-icons/fi';
import './LawyerProfile.css';

const LawyerProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [lawyer, setLawyer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [lawyerData, reviewData] = await Promise.all([
            lawyerService.getLawyerById(id),
            reviewService.getReviewsByLawyerId(id)
        ]);
        setLawyer(lawyerData);
        setReviews(reviewData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user || !comment.trim()) return;

        setSubmitting(true);
        try {
            await reviewService.addReview({
                lawyerId: id,
                userId: user.uid,
                userName: user.displayName || 'Anonymous Client',
                rating: rating,
                text: comment,
                verified: true
            });

            // Calculate & update new average rating
            const updatedReviews = await reviewService.getReviewsByLawyerId(id);
            const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / updatedReviews.length;

            await lawyerService.updateLawyerRating(id, avgRating, updatedReviews.length);

            setComment('');
            setRating(5);
            setShowReviewForm(false);
            fetchData(); // Refresh both lawyer and reviews
        } catch (error) {
            alert("Error submitting review. Please try again.");
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="profile-page" style={{ paddingTop: '100px', textAlign: 'center' }}><h2>Loading profile...</h2></div>;
    }

    if (!lawyer) {
        return <div className="profile-page" style={{ paddingTop: '100px', textAlign: 'center' }}><h2>Lawyer not found.</h2><Link to="/search">Back to Search</Link></div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="container">
                    <div className="profile-header__content">
                        <div
                            className="profile-header__avatar"
                            style={{ background: `linear-gradient(135deg, ${lawyer.color}, ${lawyer.color}cc)` }}
                        >
                            {lawyer.initials}
                        </div>
                        <div className="profile-header__info">
                            <h1 className="profile-header__name">
                                {lawyer.name}
                                {lawyer.verified && <FiCheckCircle className="profile-header__verified" title="Verified Attorney" />}
                            </h1>
                            <p className="profile-header__specialty">{lawyer.detailedSpecialty}</p>
                            <div className="profile-header__meta">
                                <span className="profile-header__location"><FiMapPin /> {lawyer.city}, Nepal</span>
                                <span className="profile-header__exp"><FiCalendar /> {lawyer.experience} experience</span>
                            </div>
                        </div>
                        <div className="profile-header__rating">
                            <div className="profile-rating-box">
                                <span className="profile-rating-value">{lawyer.rating?.toFixed(1) || '0.0'}</span>
                                <span className="profile-rating-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="profile-layout">
                    <div className="profile-main">
                        <section className="profile-section">
                            <h2 className="profile-section__title">About {lawyer.name}</h2>
                            <p className="profile-section__text">{lawyer.bio}</p>
                            <div className="profile-tags">
                                {lawyer.languages?.map(lang => (
                                    <span key={lang} className="profile-tag">{lang}</span>
                                ))}
                            </div>
                        </section>

                        <section className="profile-section reviews-section">
                            <div className="reviews-header">
                                <h2 className="profile-section__title">Client Reviews ({reviews.length})</h2>
                                {!showReviewForm && (
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => user ? setShowReviewForm(true) : navigate('/login')}
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {showReviewForm && (
                                <form className="review-form" onSubmit={handleReviewSubmit}>
                                    <div className="form-group">
                                        <label>Your Rating</label>
                                        <div className="rating-input">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FiStar
                                                    key={star}
                                                    className={`star-icon ${rating >= star ? 'star-icon--active' : ''}`}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Your Experience</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Tell us about your case and the lawyer's services..."
                                            rows="4"
                                            required
                                        />
                                    </div>
                                    <div className="review-form__actions">
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            onClick={() => setShowReviewForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-sm"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Submitting...' : 'Post Review'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="reviews-list">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="review-card">
                                            <div className="review-card__header">
                                                <div className="review-card__user">
                                                    <div className="user-avatar"><FiUser /></div>
                                                    <div>
                                                        <span className="user-name">{review.userName}</span>
                                                        <span className="review-date">
                                                            {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="review-card__rating">
                                                    <FiStar className="star-icon star-icon--active" />
                                                    <span>{review.rating}.0</span>
                                                </div>
                                            </div>
                                            <p className="review-card__text">{review.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-reviews">
                                        <FiMessageSquare />
                                        <p>No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="profile-sidebar">
                        <div className="contact-card">
                            <h3 className="contact-card__title">Contact Information</h3>
                            <div className="contact-info">
                                <div className="contact-info__item">
                                    <FiPhone /> {lawyer.phone}
                                </div>
                                <div className="contact-info__item">
                                    <FiMail /> contact@lawarna.law
                                </div>
                                <div className="contact-info__item">
                                    <FiGlobe /> www.lawarnalawoffice.com.np
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Message Lawyer
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default LawyerProfile;
