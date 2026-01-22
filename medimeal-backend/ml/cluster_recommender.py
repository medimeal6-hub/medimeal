"""
K-Means based Meal Clustering Recommender
Reuses feature engineering from MealKNNRecommender to cluster meals,
then selects meals from the nearest cluster to the user's feature vector.
"""

import numpy as np
import pickle
from typing import List, Dict

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from knn_recommender import MealKNNRecommender, create_sample_data


class MealClusterRecommender:
    def __init__(self, n_clusters: int = 8, random_state: int = 42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.kmeans = None
        self.scaler = StandardScaler()
        self.base_fe = MealKNNRecommender()  # for feature prep and user vector
        self.feature_columns = []
        self.meals_df = None
        self.feature_matrix_scaled = None

    def fit(self, meals_data: List[Dict]):
        self.meals_df = self.base_fe.meals_df = None
        self.base_fe.feature_columns = []
        self.meals_df = self.base_fe.meals_df = None
        # Prepare features via KNN recommender's logic
        self.meals_df = self.base_fe.meals_df = None
        feature_matrix = self.base_fe.prepare_features(meals_data)
        self.feature_columns = self.base_fe.feature_columns
        self.meals_df = self.base_fe.meals_df = self.base_fe.meals_df or None
        # Scale and train KMeans
        self.feature_matrix_scaled = self.scaler.fit_transform(feature_matrix)
        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=self.random_state, n_init=10)
        self.kmeans.fit(self.feature_matrix_scaled)
        # Keep original meals df
        import pandas as pd
        self.meals_df = pd.DataFrame(meals_data)

    def recommend(self, user_profile: Dict, n_recommendations: int = 5) -> List[Dict]:
        if self.kmeans is None:
            raise ValueError("Model not trained. Call fit() first.")

        # Build user feature vector with same columns
        self.base_fe.feature_columns = self.feature_columns
        user_vector = self.base_fe._create_user_features(user_profile)
        user_vector_scaled = self.scaler.transform([user_vector])

        # Find nearest cluster
        cluster_labels = self.kmeans.labels_
        user_cluster = self.kmeans.predict(user_vector_scaled)[0]

        # Select items in that cluster and sort by distance to user
        import numpy as np
        indices_in_cluster = np.where(cluster_labels == user_cluster)[0]
        if len(indices_in_cluster) == 0:
            # fallback: take nearest items overall
            distances = np.linalg.norm(self.feature_matrix_scaled - user_vector_scaled, axis=1)
            top_indices = np.argsort(distances)[:n_recommendations]
        else:
            cluster_vectors = self.feature_matrix_scaled[indices_in_cluster]
            distances = np.linalg.norm(cluster_vectors - user_vector_scaled, axis=1)
            order = np.argsort(distances)
            top_indices = indices_in_cluster[order[:n_recommendations]]

        recommendations: List[Dict] = []
        for rank, idx in enumerate(top_indices, start=1):
            meal = self.meals_df.iloc[idx].to_dict()
            # Similarity heuristic from distance
            # Avoid div by zero; use 1 / (1 + d)
            d = float(np.linalg.norm(self.feature_matrix_scaled[idx] - user_vector_scaled))
            meal['similarity_score'] = 1.0 / (1.0 + d)
            meal['rank'] = rank
            recommendations.append(meal)

        return recommendations[:n_recommendations]

    def save_model(self, filepath: str):
        model_data = {
            'kmeans': self.kmeans,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'meals_df': self.meals_df,
            'feature_matrix_scaled': self.feature_matrix_scaled
        }
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

    def load_model(self, filepath: str):
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        self.kmeans = model_data['kmeans']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.meals_df = model_data['meals_df']
        self.feature_matrix_scaled = model_data.get('feature_matrix_scaled')


if __name__ == '__main__':
    # Quick smoke test
    data = create_sample_data()
    model = MealClusterRecommender(n_clusters=8)
    model.fit(data)
    recs = model.recommend({
        'target_calories': 500,
        'preferred_meal_type': 'lunch',
        'dietary_preferences': ['vegetarian'],
        'health_conditions': [],
        'allergies': []
    }, n_recommendations=5)
    for r in recs:
        print(r['rank'], r['name'], r['type'], r['calories'])







