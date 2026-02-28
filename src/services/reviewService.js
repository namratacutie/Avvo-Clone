import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../backend/firebase';

const COLLECTION_NAME = 'reviews';

// Mock data removed as it is now in Firestore

export const reviewService = {
    // Fetch reviews for a specific lawyer
    getReviewsByLawyerId: async (lawyerId) => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('lawyerId', '==', lawyerId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching lawyer reviews:", error);
            return [];
        }
    },

    // Submit a new review
    addReview: async (reviewData) => {
        try {
            const reviewsRef = collection(db, COLLECTION_NAME);
            const docRef = await addDoc(reviewsRef, {
                ...reviewData,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    },

    // Seed mock reviews
    seedMockReviews: async () => {
        try {
            const reviewsRef = collection(db, COLLECTION_NAME);
            // Seeding logic removed as mock data is gone
            return true;
        } catch (error) {
            console.error("Error seeding reviews:", error);
            throw error;
        }
    }
};
