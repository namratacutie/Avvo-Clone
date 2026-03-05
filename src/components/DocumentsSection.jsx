import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiHome, FiHeart, FiArrowRight, FiChevronRight } from 'react-icons/fi';
import './DocumentsSection.css';

const categories = [
    {
        id: 'business',
        name: 'Business & Contracts',
        icon: <FiBriefcase />,
        iconClass: 'documents-category__icon--business',
        documents: [
            { name: 'Non-Disclosure Agreement (NDA)', slug: 'nda' },
            { name: 'Partnership Deed', slug: 'partnership-deed' },
            { name: 'Employment Contract', slug: 'employment-contract' },
            { name: 'Service Agreement', slug: 'service-agreement' },
        ]
    },
    {
        id: 'property',
        name: 'Property & Real Estate',
        icon: <FiHome />,
        iconClass: 'documents-category__icon--property',
        documents: [
            { name: 'Rent Agreement', slug: 'rent-agreement' },
            { name: 'Land Sale Deed', slug: 'land-sale-deed' },
            { name: 'Lease Agreement', slug: 'lease-agreement' },
            { name: 'Property Transfer Deed', slug: 'property-transfer' },
        ]
    },
    {
        id: 'family',
        name: 'Family & Personal',
        icon: <FiHeart />,
        iconClass: 'documents-category__icon--family',
        documents: [
            { name: 'Last Will & Testament', slug: 'will-testament' },
            { name: 'Power of Attorney', slug: 'power-of-attorney' },
            { name: 'Divorce Settlement', slug: 'divorce-settlement' },
            { name: 'Affidavit (शपथ पत्र)', slug: 'affidavit' },
        ]
    }
];

const DocumentsSection = () => {
    return (
        <section className="documents-section section">
            <div className="container">
                <div className="documents-section__header">
                    <span className="documents-section__badge">Legal Documents</span>
                    <h2 className="documents-section__title">
                        Personalize documents for your situation
                    </h2>
                    <p className="documents-section__subtitle">
                        Create legally sound documents tailored to Nepal's legal system in minutes.
                    </p>
                </div>

                <div className="documents-grid">
                    {categories.map(cat => (
                        <div key={cat.id} className="documents-category">
                            <div className="documents-category__header">
                                <div className={`documents-category__icon ${cat.iconClass}`}>
                                    {cat.icon}
                                </div>
                                <h3 className="documents-category__name">{cat.name}</h3>
                            </div>
                            <div className="documents-category__list">
                                {cat.documents.map(doc => (
                                    <Link
                                        key={doc.slug}
                                        to={`/documents/${doc.slug}`}
                                        className="documents-category__link"
                                    >
                                        <FiChevronRight /> {doc.name}
                                    </Link>
                                ))}
                            </div>
                            <Link to={`/documents?category=${cat.id}`} className="documents-category__more">
                                See more documents <FiArrowRight />
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="documents-section__cta">
                    <Link to="/documents" className="documents-section__cta-btn">
                        See all documents <FiArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default DocumentsSection;
