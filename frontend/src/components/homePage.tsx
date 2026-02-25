import { useState, useEffect } from 'react';
import RecipeCard from './recipeCard';

function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('All');

    const cuisines = ['All', 'Italian', 'Mediterranean', 'Asian', 'Mexican', 'American'];

    // נתוני דמי (Mock data) כדי לראות את העיצוב עד שנחבר לשרת
    const mockRecipes = [
        { id: '1', title: 'Pasta with Tomato and Basil Sauce', description: 'Classic Italian pasta with fresh tomato sauce and basil', cuisine: 'Italian', calories: 420, protein: 14, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500', authorName: 'Sarah Cohen', authorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Cohen', likes: 1, comments: 1 },
        { id: '2', title: 'Fresh Greek Salad', description: 'Classic Mediterranean salad with feta cheese and olives', cuisine: 'Mediterranean', calories: 280, protein: 9, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', authorName: 'Michal Abraham', authorAvatar: 'https://ui-avatars.com/api/?name=Michal+Abraham', likes: 2, comments: 0 },
        { id: '3', title: 'Fried Rice with Vegetables', description: 'Quick and healthy Asian dish', cuisine: 'Asian', calories: 380, protein: 12, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500', authorName: 'Sarah Cohen', authorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Cohen', likes: 0, comments: 0 },
    ];

    return (
        <div className="container-fluid p-5">
            <h2 className="fw-bold" style={{ color: '#e81e61' }}>Discover Recipes</h2>
            <p className="text-muted mb-4">Explore delicious recipes from our community</p>
            
            {/* search box */}
            <div className="position-relative mb-4" style={{ maxWidth: '800px' }}>
                <input 
                    type="text" 
                    className="form-control form-control-lg border-0 shadow-sm" 
                    placeholder="Search recipes..." 
                    style={{ borderRadius: '20px', paddingRight: '40px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>

            {/* filter buttons */}
            <div className="d-flex gap-2 mb-5 overflow-auto">
                {cuisines.map(cuisine => (
                    <button 
                        key={cuisine}
                        className={`btn rounded-pill px-4 shadow-sm ${cuisineFilter === cuisine ? 'text-white' : 'bg-white text-dark border-0'}`}
                        style={{ backgroundColor: cuisineFilter === cuisine ? '#e81e61' : '' }}
                        onClick={() => setCuisineFilter(cuisine)}
                    >
                        {cuisine}
                    </button>
                ))}
            </div>

            {/* גריד המתכונים */}
            <div className="row g-4">
                {mockRecipes.map(recipe => (
                    <div className="col-12 col-md-6 col-lg-4" key={recipe.id}>
                        <RecipeCard {...recipe} onLike={(id) => console.log('Liked:', id)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;