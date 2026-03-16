import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { toggleLike, getPosts, aiSearch } from '../services/postService';

function HomePage() {
    const [posts, setPosts] = useState<any[]>([]); 
    const [searchQuery, setSearchQuery] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authMessage, setAuthMessage] = useState<string | null>(null);
    
    const cuisines = ['All', 'Italian', 'Mediterranean', 'Asian', 'Mexican', 'American'];

    const formatPosts = (data: any[]) => {
        const currentUserId = localStorage.getItem('userId');
        return data.map((post: any) => ({
            id: post._id,
            title: post.title,
            description: post.description,
            cuisine: post.cuisine,
            imageUrl: post.imgUrl,
            calories: post.nutrition?.calories || 0,
            protein: post.nutrition?.protein || 0,
            authorName: post.owner?.username || "Unknown User", 
            authorAvatar: post.owner?.imgUrl || `https://ui-avatars.com/api/?name=${post.owner?.username || 'User'}&background=random`,
            likes: Array.isArray(post.likes) ? post.likes.length : 0,
            isLiked: Array.isArray(post.likes) ? post.likes.includes(currentUserId) : false,
            comments: post.commentsCount || 0
        }));
    };

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const selectedCuisine = cuisineFilter === 'All' ? '' : cuisineFilter;
                const data = await getPosts(1, selectedCuisine, searchQuery); 
                setPosts(formatPosts(data)); 
            } catch (err) {
                console.error(err);
                setError("Failed to fetch posts.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [cuisineFilter]);

    const handleAiSearch = async () => {
        if (!searchQuery.trim()) {
        const data = await getPosts(1, cuisineFilter === 'All' ? '' : cuisineFilter, '');
        setPosts(formatPosts(data));
        return;
    }
    
        setIsLoading(true);
        setError(null);
        try {
            const data = await aiSearch(searchQuery);
            setPosts(formatPosts(data));
            if (data.length === 0) {
                setError("No recipes found for this search.");
            }
        } catch (err) {
            console.error(err);
            setError("AI search service error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setAuthMessage("You need to be logged in to like a post!");
            setTimeout(() => setAuthMessage(null), 3000); 
            return;
        }
        try {
            const updatedPostFromDB = await toggleLike(postId);
            const currentUserId = localStorage.getItem('userId');

            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { 
                            ...post, 
                            likes: updatedPostFromDB.likes.length,
                            isLiked: updatedPostFromDB.likes.includes(currentUserId)
                          } 
                        : post
                )
            );
        } catch (err) {
            setAuthMessage("Action failed.");
            setTimeout(() => setAuthMessage(null), 3000); 
        }
    };

    return (
        <div className="container-fluid p-5">
            <h2 className="fw-bold" style={{ color: '#e81e61' }}>Discover Recipes</h2>
            <p className="text-muted mb-4">Explore delicious recipes from our community</p>
            
            <div className="d-flex mb-4 gap-2" style={{ maxWidth: '800px' }}>
                <div className="position-relative flex-grow-1">
                    <input 
                        type="text" 
                        className="form-control form-control-lg border-0 shadow-sm" 
                        placeholder="Try: 'Low calorie Italian' or 'Spicy Mexican'..." 
                        style={{ borderRadius: '20px', paddingRight: '40px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                    />
                    <i className="bi bi-magic position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                </div>
                <button 
                    onClick={handleAiSearch}
                    className="btn text-white px-4 shadow-sm"
                    style={{ backgroundColor: '#e81e61', borderRadius: '20px' }}
                    disabled={isLoading}
                >
                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'AI Search'}
                </button>
            </div>

            <div className="d-flex gap-2 mb-5 overflow-auto pb-2">
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

            {isLoading && (
                <div className="text-center my-5">
                    <div className="spinner-border text-danger" role="status"></div>
                </div>
            )}
            
            {error && <div className="alert alert-danger m-3">{error}</div>}
            {posts.length === 0 && !error && !isLoading && <p className="m-3 text-center">No recipes found.</p>} 

            {!isLoading && !error && posts.length > 0 && (
                <div className="row g-4">
                    {posts.map(post => (
                        <div className="col-12 col-md-6 col-lg-4" key={post.id}>
                            <PostCard {...post} onLike={handleLike} />
                        </div>
                    ))}
                </div>
            )}

            {authMessage && (
                <div className="alert alert-warning alert-dismissible fade show position-fixed bottom-0 end-0 m-4 shadow-lg" role="alert" style={{ zIndex: 1050, borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {authMessage}
                    <button type="button" className="btn-close" onClick={() => setAuthMessage(null)}></button>
                </div>
            )}
        </div>
    );
}

export default HomePage;