import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { getPosts } from '../services/postService';

function HomePage() {
    const [posts, setPosts] = useState<any[]>([]); 
    const [searchQuery, setSearchQuery] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('All');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cuisines = ['All', 'Italian', 'Mediterranean', 'Asian', 'Mexican', 'American'];

    // Fetching Data
    // Fetching Data
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // שלב 1: עכשיו שולחים את הפרמטרים האמיתיים!
                // אם המטבח הוא All נשלח מחרוזת ריקה כדי שהשרת לא יסנן לפי מטבח
                const selectedCuisine = cuisineFilter === 'All' ? '' : cuisineFilter;
                const data = await getPosts(1, selectedCuisine, searchQuery); 
                
                // שלב 2: מיפוי המידע לשמות שהקומפוננטה מכירה
                const formattedPosts = data.map((post: any) => ({
                    id: post._id,
                    title: post.title,
                    description: post.description,
                    cuisine: post.cuisine,
                    imageUrl: post.imgUrl,
                    calories: post.nutrition?.calories || 0,
                    protein: post.nutrition?.protein || 0,
                    authorName: post.owner, 
                    authorAvatar: "https://ui-avatars.com/api/?name=Chef",
                    likes: post.likes?.length || 0,
                    comments: 0
                }));

                setPosts(formattedPosts); 
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Failed to fetch posts. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [cuisineFilter, searchQuery]); 

    return (
        <div className="container-fluid p-5">
            <h2 className="fw-bold" style={{ color: '#e81e61' }}>Discover Recipes</h2>
            <p className="text-muted mb-4">Explore delicious recipes from our community</p>
            
            {/* search box */}
            <div className="position-relative mb-4" style={{ maxWidth: '800px' }}>
                <input 
                    type="text" 
                    className="form-control form-control-lg border-0 shadow-sm" 
                    placeholder="Search posts..." 
                    style={{ borderRadius: '20px', paddingRight: '40px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>

            {/* filter buttons*/}
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

            {isLoading && <div className="spinner-border text-danger" role="status"></div>}
            {error && <div className="alert alert-danger m-3">{error}</div>}
            {posts.length === 0 && !error && !isLoading && <p className="m-3">No posts to display</p>} 

            {/* posts grid */}
            {!isLoading && !error && posts.length > 0 && (
                <div className="row g-4">
                    {posts.map(post => (
                        <div className="col-12 col-md-6 col-lg-4" key={post.id}>
                            <PostCard {...post} onLike={(id) => console.log('Liked:', id)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomePage;