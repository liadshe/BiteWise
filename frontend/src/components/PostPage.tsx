import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { toggleLike, getPostById } from '../services/postService';
import { getCommentsByPostId, addComment } from '../services/commentService';


// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


function PostPage() {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate(); 
    
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [postData, commentsData] = await Promise.all([
                    getPostById(id),
                    getCommentsByPostId(id)
                ]);
                setPost(postData);
                setComments(commentsData);
            } catch (error) {
                console.error("Error fetching post details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) return <div className="p-5 text-center"><div className="spinner-border" style={{color: '#e81e61'}}></div></div>;
    if (!post) return <div className="p-5 text-center">Post not found</div>;

    const handleLike = async () => {
        if (!post || !id) return;
        
        const accessToken = localStorage.getItem('accessToken'); 
        const userId = localStorage.getItem('userId');

        if (!accessToken) {
            setToastMessage("You need to be logged in to like a recipe!");
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        try {
            await toggleLike(id);
            const isLiked = post.likes.includes(userId);
            const newLikes = isLiked 
                ? post.likes.filter((uid: string) => uid !== userId)
                : [...post.likes, userId];

            setPost({ ...post, likes: newLikes });
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !id) return;

        const accessToken = localStorage.getItem('accessToken'); 

        if (!accessToken) {
            setToastMessage("You need to be logged in to post a comment!");
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        try {
            const addedComment = await addComment(id, newComment);
            const currentUsername = localStorage.getItem('username') || 'Me';
            const currentAvatar = localStorage.getItem('imgUrl') || 'default-avatar.png';
            
            const commentForDisplay = {
                ...addedComment,
                owner: { username: currentUsername, imgUrl: currentAvatar },
                createdAt: new Date().toISOString()
            };

            setComments([commentForDisplay, ...comments]);
            setNewComment(''); 
        } catch (error) {
            console.error("Failed to add comment", error);
            setToastMessage("Please log in to share your thoughts!");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const getImageUrl = (url: string | undefined) => {
    if (!url) return '/default-avatar.png'; // fallback if user has no image at all
    if (url.startsWith('http')) return url; // handles Google Auth images
    
    let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    if (!cleanUrl.startsWith('uploads/')) {
        cleanUrl = `uploads/${cleanUrl}`;
    }
    return `${API_BASE_URL}/${cleanUrl}`;
};

    return (
        <div className="container py-4" style={{ maxWidth: '1100px' }}>
            
            {/* Top Navigation */}
            <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted p-0 mb-4 fw-bold d-flex align-items-center">
                <i className="bi bi-arrow-left me-2"></i> Back to Recipes
            </button>

            {/* Header Section */}
            <div className="mb-4">
                <div className="d-flex align-items-center mb-2 gap-2">
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#fdf3f6', color: '#e81e61', letterSpacing: '0.5px' }}>
                        {post.cuisine}
                    </span>
                </div>
                
                <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '2.5rem' }}>{post.title}</h2>
                
                <div className="d-flex align-items-center text-muted">
                    <img 
                        src={getImageUrl(post.owner?.imgUrl) || 'default-avatar.png'} 
                        alt="Author" 
                        className="rounded-circle object-fit-cover me-2 shadow-sm" 
                        width="35" height="35" 
                    />
                    <span>Recipe by <span className="fw-bold text-dark">{post.owner?.username || "Unknown Chef"}</span> • {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            {/* --- MAIN SPLIT LAYOUT --- */}
            <div className="row g-4 mb-5">
                
                {/* LEFT COLUMN: Image & Description & Nutrition */}
                <div className="col-lg-5 d-flex flex-column gap-4">
                    
                    {/* Main Image with Floating Like Button */}
                    <div className="position-relative">
                        <img 
                            src={getImageUrl(post.imgUrl)} 
                            alt={post.title} 
                            className="w-100 shadow-sm"
                            style={{ height: '380px', objectFit: 'cover', borderRadius: '16px' }} 
                        />
                        <button 
                            onClick={handleLike} 
                            className="btn position-absolute border-0 shadow-sm bg-white rounded-circle d-flex justify-content-center align-items-center"
                            style={{ width: '50px', height: '50px', bottom: '-20px', right: '30px', transition: 'transform 0.2s', zIndex: 10 }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <i className={`bi ${post.likes?.includes(localStorage.getItem('userId')) ? 'bi-heart-fill text-danger' : 'bi-heart'}`} style={{ fontSize: '1.5rem', color: '#e81e61', marginTop: '3px' }}></i>
                        </button>
                    </div>

                    {/* Description */}
                    <div className="mt-2 pe-2">
                        <p className="fs-6 text-dark mb-0 lh-base" style={{ fontStyle: 'italic' }}>
                            "{post.description}"
                        </p>
                    </div>

                    {/* Nutrition Card */}
                    <div className="bg-light p-3 rounded-4 border d-flex justify-content-around text-center shadow-sm">
                        <div>
                            <span className="d-block text-muted small text-uppercase fw-bold mb-1">Calories</span>
                            <span className="fw-bold fs-5 text-dark">{post.nutrition?.calories || 0}</span>
                        </div>
                        <div className="border-end border-2"></div>
                        <div>
                            <span className="d-block text-muted small text-uppercase fw-bold mb-1">Protein</span>
                            <span className="fw-bold fs-5 text-dark">{post.nutrition?.protein || 0}g</span>
                        </div>
                        {post.nutrition?.confidence && (
                            <>
                                <div className="border-end border-2"></div>
                                <div>
                                    <span className="d-block text-muted small text-uppercase fw-bold mb-1"><i className="bi bi-robot me-1"></i> AI Match</span>
                                    <span className="fw-bold fs-5" style={{ color: '#e81e61' }}>{post.nutrition.confidence}%</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* AI Suggestion Alert */}
                    {post.nutrition?.suggestions && (
                        <div className="alert border-0 d-flex align-items-center shadow-sm mb-0" style={{ backgroundColor: '#fff', borderLeft: '4px solid #e81e61', borderRadius: '8px' }}>
                            <i className="bi bi-lightbulb fs-4 me-3" style={{ color: '#e81e61' }}></i>
                            <div>
                                <strong className="d-block mb-1" style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#e81e61' }}>AI Health Tip</strong>
                                <span className="text-dark small">{post.nutrition.suggestions}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Ingredients & Instructions */}
                <div className="col-lg-7 d-flex flex-column gap-4">
                    
                    {/* Ingredients Section */}
                    <div className="card border-0 shadow-sm p-4 d-flex flex-column" style={{ borderRadius: '16px', flex: '1', maxHeight: '300px' }}>
                        <h5 className="fw-bold text-dark border-bottom pb-3 mb-3" style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>Ingredients</h5>
                        
                        <div className="pe-2 flex-grow-1" style={{ overflowY: 'auto' }}>
                            {post.ingredients && post.ingredients.length > 0 ? (
                                <ul className="list-unstyled mb-0">
                                    {post.ingredients.map((ing: any, idx: number) => (
                                        <li key={idx} className="mb-3 d-flex align-items-start">
                                            <i className="bi bi-check2-circle mt-1 me-3" style={{ color: '#e81e61', fontSize: '1.2rem' }}></i>
                                            <div>
                                                <span className="d-block fw-bold text-dark">{ing.amount}</span>
                                                <span className="text-muted">{ing.name}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No ingredients listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="card border-0 shadow-sm p-4 d-flex flex-column" style={{ borderRadius: '16px', flex: '1', maxHeight: '350px' }}>
                        <h5 className="fw-bold text-dark border-bottom pb-3 mb-3" style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>Instructions</h5>
                        
                        <div className="pe-2 flex-grow-1" style={{ overflowY: 'auto' }}>
                            {post.instructions && post.instructions.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {post.instructions.map((inst: string, idx: number) => (
                                        <div key={idx} className="d-flex align-items-start bg-light p-3 rounded-4">
                                            <div className="me-3">
                                                <span className="fw-bold fs-4" style={{ color: '#e81e61' }}>{idx + 1}.</span>
                                            </div>
                                            <p className="mb-0 text-dark lh-base mt-1">{inst}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No instructions listed.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <hr className="my-5 opacity-25" />

            {/* Comments Section */}
            <div className="mx-auto" style={{ maxWidth: '850px' }}>
                <h4 className="fw-bold mb-4 text-dark">Reviews ({comments.length})</h4>
                
                <form onSubmit={handleAddComment} className="mb-5 d-flex gap-3">
                    <img 
                    src={getImageUrl(localStorage.getItem('imgUrl') || '')} 
                    alt="You" 
                    className="rounded-circle object-fit-cover shadow-sm" 
                    width="45" height="45" 
                />
                    <div className="flex-grow-1">
                        <textarea 
                            className="form-control bg-light border-0 shadow-sm p-3 mb-2" 
                            placeholder="What did you think about this recipe?" 
                            value={newComment}
                            rows={2}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ borderRadius: '12px', resize: 'none' }}
                        ></textarea>
                        <div className="text-end">
                            <button type="submit" className="btn text-white px-4 fw-bold shadow-sm" style={{ backgroundColor: '#e81e61', borderRadius: '10px' }}>
                                Post Review
                            </button>
                        </div>
                    </div>
                </form>

                <div className="d-flex flex-column gap-4">
                    {comments.length === 0 ? (
                        <p className="text-muted text-center py-4 bg-light rounded-4 border border-light">No comments yet. Be the first to review this recipe!</p>
                    ) : (
                        comments.map((comment: any, index: number) => {
                        const dateStr = comment.createdAt 
                        ? new Date(comment.createdAt).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',  
                        minute: '2-digit'  
                        }) 
                        : 'Just now';

                            return (
                                <div key={index} className="d-flex gap-3">
                                    <img 
                                    src={getImageUrl(comment.owner?.imgUrl) || 'default-avatar.png'} 
                                    alt="avatar" 
                                    className="rounded-circle object-fit-cover shadow-sm mt-1" 
                                    width="45" height="45" 
                                />
                                    <div className="flex-grow-1 bg-light p-3 rounded-4 border border-light">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0 fw-bold text-dark">{comment.owner?.username || "Unknown User"}</h6>
                                            <small className="text-muted">{dateStr}</small>
                                        </div>
                                        <p className="text-dark mb-0">{comment.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {toastMessage && (
                <div className="alert alert-warning alert-dismissible fade show position-fixed bottom-0 end-0 m-4 shadow-lg" role="alert" style={{ zIndex: 1050, borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {toastMessage}
                    <button type="button" className="btn-close" onClick={() => setToastMessage(null)}></button>
                </div>
            )}
        </div>
    );
}

export default PostPage;