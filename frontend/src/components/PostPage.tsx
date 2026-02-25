import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { toggleLike, getPostById } from '../services/postService';

import { getCommentsByPostId, addComment } from '../services/commentService';

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

    if (isLoading) return <div className="p-5 text-center"><div className="spinner-border text-danger"></div></div>;
    if (!post) return <div className="p-5 text-center">Post not found</div>;

    const handleLike = async () => {
    if (!post || !id) return;
    
    const token = localStorage.getItem('token'); // בדיקה לפי טוקן
    const userId = localStorage.getItem('userId');

    if (!token) {
        setToastMessage("You need to be logged in to like a post!");
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

    const token = localStorage.getItem('token'); // בדיקה לפי טוקן

    if (!token) {
        setToastMessage("You need to be logged in to post a comment!");
        setTimeout(() => setToastMessage(null), 3000);
        return;
    }

    try {
        const addedComment = await addComment(id, newComment);
        const currentUsername = localStorage.getItem('username') || 'Me';
        const currentAvatar = `https://ui-avatars.com/api/?name=${currentUsername}&background=random`;
        
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
    return (
        <div className="container p-4" style={{ maxWidth: '750px' }}>
            
            {/* back button */}
            <button 
                onClick={() => navigate(-1)} 
                className="btn btn-light mb-4 shadow-sm fw-bold"
                style={{ borderRadius: '12px' }}
            >
                <i className="bi bi-arrow-left me-2"></i> Back to Recipes
            </button>

           {/* post details */}
<div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '16px', overflow: 'hidden' }}>
    <img 
        src={post.imgUrl?.startsWith('http') ? post.imgUrl : `/${post.imgUrl}`} 
        alt={post.title} 
        style={{ height: '280px', objectFit: 'cover', width: '100%' }} 
    />
    <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge px-3 py-2" style={{ backgroundColor: '#e81e61', borderRadius: '10px' }}>{post.cuisine}</span>
            
            <div 
                onClick={handleLike} 
                style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {/* if user already liked the post */}
                <i className={`bi ${post.likes?.includes(localStorage.getItem('userId')) ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`} style={{ fontSize: '1.2rem' }}></i> 
                <span className="text-muted fw-bold">{post.likes?.length || 0}</span>
            </div>
        </div>
        
        <h2 className="fw-bold mb-3">{post.title}</h2>
        <p className="text-muted mb-4">{post.description}</p>
                    
                    <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge rounded-pill px-3 py-2 border" style={{ backgroundColor: '#fcf0f4', color: '#e81e61', fontSize: '0.9rem' }}>
                             {post.nutrition?.calories || 0} Calories
                        </span>
                        <span className="badge rounded-pill px-3 py-2 border" style={{ backgroundColor: '#e81e61', color: 'white', fontSize: '0.9rem' }}>
                             {post.nutrition?.protein || 0}g Protein
                        </span>
                        {post.nutrition?.suggestions && (
                            <span className="badge rounded-pill px-3 py-2 border text-dark bg-light" style={{ fontSize: '0.9rem' }}>
                                 {post.nutrition.suggestions}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* comments field */}
            <h5 className="fw-bold mb-4">Comments ({comments.length})</h5>
            
            {/* add comment */}
            <form onSubmit={handleAddComment} className="mb-4 d-flex gap-2">
                <input 
                    type="text" 
                    className="form-control bg-white border-0 shadow-sm" 
                    placeholder="Add a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ borderRadius: '12px' }}
                />
                <button type="submit" className="btn text-white px-4 fw-bold shadow-sm" style={{ backgroundColor: '#e81e61', borderRadius: '12px' }}>
                    Post
                </button>
            </form>

            {/* comments list */}
            <div className="d-flex flex-column gap-3 mb-5">
                {comments.length === 0 ? (
                    <p className="text-muted text-center py-4 bg-white rounded shadow-sm">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment: any, index: number) => {
                        const dateStr = comment.createdAt 
                            ? new Date(comment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                            : 'Just now';

                        return (
                            <div key={index} className="d-flex gap-3 p-3 bg-white shadow-sm" style={{ borderRadius: '12px' }}>
                                {/* owner img */}
                                <img 
                                    src={comment.owner?.imgUrl || `https://ui-avatars.com/api/?name=${comment.owner?.username || 'User'}&background=random`} 
                                    alt="avatar" 
                                    className="rounded-circle" 
                                    width="42" 
                                    height="42" 
                                    style={{ objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="mb-0 fw-bold">{comment.owner?.username || "Unknown User"}</h6>
                                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>{dateStr}</small>
                                    </div>
                                    <p className="mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{comment.content}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

    {/* toast for unauthenticated users */}
   {toastMessage && (
    <div 
        className="alert alert-warning alert-dismissible fade show position-fixed bottom-0 end-0 m-4 shadow-lg" 
        role="alert" 
        style={{ zIndex: 1050, borderRadius: '12px' }}
    >
        <i className="bi bi-exclamation-circle me-2"></i>
        {toastMessage}
        <button type="button" className="btn-close" onClick={() => setToastMessage(null)}></button>
    </div>
)}

    
        </div>
    );
}

export default PostPage;