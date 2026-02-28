import React from 'react';
import { FiEdit3, FiUsers, FiCheckCircle } from 'react-icons/fi';
import './HowItWorks.css';

const steps = [
    {
        icon: <FiEdit3 />,
        step: '01',
        title: 'Describe Your Legal Issue',
        description: 'Tell us about your situation — whether it\'s a divorce, traffic ticket, or business dispute. The more details, the better we can match you.',
    },
    {
        icon: <FiUsers />,
        step: '02',
        title: 'Get Matched with Lawyers',
        description: 'We\'ll connect you with experienced, top-rated attorneys in your area who specialize in your type of case.',
    },
    {
        icon: <FiCheckCircle />,
        step: '03',
        title: 'Choose the Right Lawyer',
        description: 'Compare profiles, read reviews, check Find Lawyer Nepal ratings, and choose the attorney that\'s the best fit for you. It\'s free to search.',
    },
];

const HowItWorks = () => {
    return (
        <section className="how-it-works section">
            <div className="container">
                <div className="text-center">
                    <h2 className="section-title">How Find Lawyer Nepal Works</h2>
                    <p className="section-subtitle mx-auto">
                        Finding the right lawyer has never been easier. Here's how it works in three simple steps.
                    </p>
                </div>

                <div className="how-it-works__steps">
                    {steps.map((step, index) => (
                        <div key={index} className="how-it-works__step" style={{ animationDelay: `${index * 0.15}s` }}>
                            <div className="how-it-works__step-number">{step.step}</div>
                            <div className="how-it-works__step-icon">{step.icon}</div>
                            <h3 className="how-it-works__step-title">{step.title}</h3>
                            <p className="how-it-works__step-desc">{step.description}</p>
                            {index < steps.length - 1 && <div className="how-it-works__connector"></div>}
                        </div>
                    ))}
                </div>

                <div className="how-it-works__cta text-center">
                    <button className="btn btn-primary btn-lg">Get Started — It's Free</button>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
