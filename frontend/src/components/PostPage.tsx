import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { toggleLike, getPostById, deletePost } from '../services/postService'; 
import { getCommentsByPostId, addComment, updateComment, deleteComment } from '../services/commentService';

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

    // --- NEW MODAL STATE ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'post' | 'comment' } | null>(null);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const currentUserId = localStorage.getItem('userId');
    const isOwner = post?.owner?._id === currentUserId;

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

    // --- BEAUTIFUL DELETE HANDLERS ---
    const openDeleteModal = (itemId: string, type: 'post' | 'comment') => {
        setItemToDelete({ id: itemId, type });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            if (itemToDelete.type === 'post') {
                await deletePost(itemToDelete.id);
                navigate('/home');
            } else {
                await deleteComment(itemToDelete.id);
                setComments(comments.filter(c => c._id !== itemToDelete.id));
            }
        } catch (error) {
            setToastMessage(`Failed to delete ${itemToDelete.type}.`);
            setTimeout(() => setToastMessage(null), 3000);
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleLike = async () => {
        if (!post || !id) return;
        const accessToken = localStorage.getItem('accessToken'); 
        if (!accessToken) {
            setToastMessage("You need to be logged in to like a recipe!");
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }
        try {
            await toggleLike(id);
            const isLiked = post.likes.includes(currentUserId);
            const newLikes = isLiked 
                ? post.likes.filter((uid: string) => uid !== currentUserId)
                : [...post.likes, currentUserId];
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
            const commentForDisplay = {
                ...addedComment,
                owner: { _id: currentUserId, username: localStorage.getItem('username') || 'Me', imgUrl: localStorage.getItem('imgUrl') || 'default-avatar.png' },
                createdAt: new Date().toISOString()
            };
            setComments([commentForDisplay, ...comments]);
            setNewComment(''); 
        } catch (error) {
            setToastMessage("Failed to post comment.");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editCommentContent.trim()) return;
        try {
            await updateComment(commentId, editCommentContent);
            setComments(comments.map(c => c._id === commentId ? { ...c, content: editCommentContent } : c));
            setEditingCommentId(null);
        } catch (error) {
            setToastMessage("Failed to update comment.");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const startEditing = (comment: any) => {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
    };

    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/default-avatar.png'; 
        if (url.startsWith('http')) return url; 
        let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        if (!cleanUrl.startsWith('uploads/')) cleanUrl = `uploads/${cleanUrl}`;
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    return (
        <div className="container py-4" style={{ maxWidth: '1100px' }}>
            
            {/* Custom Delete Confirmation Modal Overlay */}
            {showDeleteModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
                    <div className="bg-white p-4 shadow-lg text-center" style={{ borderRadius: '20px', maxWidth: '400px', width: '90%' }}>
                        <div className="mb-3 text-danger">
                            <i className="bi bi-exclamation-octagon fs-1"></i>
                        </div>
                        <h4 className="fw-bold">Are you sure?</h4>
                        <p className="text-muted">This action cannot be undone. This {itemToDelete?.type} will be permanently removed.</p>
                        <div className="d-flex gap-2 justify-content-center mt-4">
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-light px-4 py-2 fw-bold" style={{ borderRadius: '10px' }}>Cancel</button>
                            <button onClick={confirmDelete} className="btn btn-danger px-4 py-2 fw-bold" style={{ borderRadius: '10px' }}>Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation */}
            <button onClick={() => navigate('/home')} className="btn btn-link text-decoration-none text-muted p-0 mb-4 fw-bold d-flex align-items-center">
                <i className="bi bi-arrow-left me-2"></i> Back to Recipes
            </button>

            {/* Header Section */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <div className="d-flex align-items-center mb-2 gap-2">
                            <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#fdf3f6', color: '#e81e61', letterSpacing: '0.5px' }}>
                                {post.cuisine}
                            </span>
                        </div>
                        <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '2.5rem' }}>{post.title}</h2>
                    </div>

                    {isOwner && (
                        <div className="d-flex gap-2 mt-2">
                            <button onClick={() => navigate(`/home/edit/${id}`)} className="btn btn-outline-primary d-flex align-items-center shadow-sm" style={{ borderRadius: '10px' }}>
                                <i className="bi bi-pencil-square me-2"></i> Edit
                            </button>
                            <button onClick={() => openDeleteModal(id!, 'post')} className="btn btn-outline-danger d-flex align-items-center shadow-sm" style={{ borderRadius: '10px' }}>
                                <i className="bi bi-trash3 me-2"></i> Delete
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="d-flex align-items-center text-muted">
                    <img src={getImageUrl(post.owner?.imgUrl)} alt="Author" className="rounded-circle object-fit-cover me-2 shadow-sm" width="35" height="35" />
                    <span>Recipe by <span className="fw-bold text-dark">{post.owner?.username || "Unknown Chef"}</span> • {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Main Layout Content */}
            <div className="row g-4 mb-5">
                <div className="col-lg-5 d-flex flex-column gap-4">
                    <div className="position-relative">
                        <img src={getImageUrl(post.imgUrl)} alt={post.title} className="w-100 shadow-sm" style={{ height: '380px', objectFit: 'cover', borderRadius: '16px' }} />
                        <button onClick={handleLike} className="btn position-absolute border-0 shadow-sm bg-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px', bottom: '-20px', right: '30px' }}>
                            <i className={`bi ${post.likes?.includes(currentUserId) ? 'bi-heart-fill text-danger' : 'bi-heart'}`} style={{ fontSize: '1.5rem', color: '#e81e61', marginTop: '3px' }}></i>
                        </button>
                    </div>
                    <div className="mt-2 pe-2"><p className="fs-6 text-dark mb-0 lh-base" style={{ fontStyle: 'italic' }}>"{post.description}"</p></div>
                    <div className="bg-light p-3 rounded-4 border d-flex justify-content-around text-center shadow-sm">
                        <div><span className="d-block text-muted small text-uppercase fw-bold mb-1">Calories</span><span className="fw-bold fs-5 text-dark">{post.nutrition?.calories || 0}</span></div>
                        <div className="border-end border-2"></div>
                        <div><span className="d-block text-muted small text-uppercase fw-bold mb-1">Protein</span><span className="fw-bold fs-5 text-dark">{post.nutrition?.protein || 0}g</span></div>
                        {post.nutrition?.confidence && (
                            <>
                                <div className="border-end border-2"></div>
                                <div><span className="d-block text-muted small text-uppercase fw-bold mb-1"><i className="bi bi-robot me-1"></i> AI Match</span><span className="fw-bold fs-5" style={{ color: '#e81e61' }}>{post.nutrition.confidence}%</span></div>
                            </>
                        )}
                    </div>
                </div>

                <div className="col-lg-7 d-flex flex-column gap-4">
                    <div className="card border-0 shadow-sm p-4 d-flex flex-column" style={{ borderRadius: '16px', flex: '1', maxHeight: '300px' }}>
                        <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Ingredients</h5>
                        <div className="pe-2 flex-grow-1" style={{ overflowY: 'auto' }}>
                            <ul className="list-unstyled mb-0">
                                {post.ingredients?.map((ing: any, idx: number) => (
                                    <li key={idx} className="mb-3 d-flex align-items-start">
                                        <i className="bi bi-check2-circle mt-1 me-3" style={{ color: '#e81e61', fontSize: '1.2rem' }}></i>
                                        <div><span className="d-block fw-bold text-dark">{ing.amount}</span><span className="text-muted">{ing.name}</span></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="card border-0 shadow-sm p-4 d-flex flex-column" style={{ borderRadius: '16px', flex: '1', maxHeight: '350px' }}>
                        <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Instructions</h5>
                        <div className="pe-2 flex-grow-1" style={{ overflowY: 'auto' }}>
                            <div className="d-flex flex-column gap-3">
                                {post.instructions?.map((inst: string, idx: number) => (
                                    <div key={idx} className="d-flex align-items-start bg-light p-3 rounded-4">
                                        <div className="me-3"><span className="fw-bold fs-4" style={{ color: '#e81e61' }}>{idx + 1}.</span></div>
                                        <p className="mb-0 text-dark lh-base mt-1">{inst}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-5 opacity-25" />

            {/* Reviews Section */}
            <div className="mx-auto" style={{ maxWidth: '850px' }}>
                <h4 className="fw-bold mb-4 text-dark">Reviews ({comments.length})</h4>
                <form onSubmit={handleAddComment} className="mb-5 d-flex gap-3">
                    <img src={getImageUrl(localStorage.getItem('imgUrl') || '')} alt="You" className="rounded-circle object-fit-cover shadow-sm" width="45" height="45" />
                    <div className="flex-grow-1">
                        <textarea className="form-control bg-light border-0 shadow-sm p-3 mb-2" placeholder="What did you think about this recipe?" value={newComment} rows={2} onChange={(e) => setNewComment(e.target.value)} style={{ borderRadius: '12px', resize: 'none' }}></textarea>
                        <div className="text-end"><button type="submit" className="btn text-white px-4 fw-bold shadow-sm" style={{ backgroundColor: '#e81e61', borderRadius: '10px' }}>Post Review</button></div>
                    </div>
                </form>

                <div className="d-flex flex-column gap-4">
                    {comments.map((comment: any, index: number) => {
                        const isCommentOwner = comment.owner?._id === currentUserId;
                        return (
                            <div key={index} className="d-flex gap-3">
                                <img src={getImageUrl(comment.owner?.imgUrl)} alt="avatar" className="rounded-circle object-fit-cover shadow-sm mt-1" width="45" height="45" />
                                <div className="flex-grow-1 bg-light p-3 rounded-4 border border-light">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div><h6 className="mb-0 fw-bold text-dark d-inline me-2">{comment.owner?.username}</h6><small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small></div>
                                        {isCommentOwner && editingCommentId !== comment._id && (
                                            <div className="d-flex gap-2">
                                                <button onClick={() => startEditing(comment)} className="btn btn-sm btn-link text-primary p-0"><i className="bi bi-pencil-square"></i></button>
                                                <button onClick={() => openDeleteModal(comment._id, 'comment')} className="btn btn-sm btn-link text-danger p-0"><i className="bi bi-trash3"></i></button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment._id ? (
                                        <div>
                                            <textarea className="form-control mb-2 border-0 shadow-sm" rows={2} value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} style={{ borderRadius: '8px', resize: 'none' }} />
                                            <div className="d-flex justify-content-end gap-2">
                                                <button onClick={() => setEditingCommentId(null)} className="btn btn-sm btn-outline-secondary">Cancel</button>
                                                <button onClick={() => handleUpdateComment(comment._id)} className="btn btn-sm text-white" style={{ backgroundColor: '#e81e61' }}>Save</button>
                                            </div>
                                        </div>
                                    ) : (<p className="text-dark mb-0">{comment.content}</p>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {toastMessage && (
                <div className="alert alert-warning alert-dismissible fade show position-fixed bottom-0 end-0 m-4 shadow-lg" style={{ zIndex: 1050, borderRadius: '12px' }}>
                    {toastMessage}
                    <button type="button" className="btn-close" onClick={() => setToastMessage(null)}></button>
                </div>
            )}
        </div>
    );
}

export default PostPage;