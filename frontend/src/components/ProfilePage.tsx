import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import { toggleLike, getPosts, deletePost } from '../services/postService';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Profile Edit States ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- Post Delete States ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);

    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/default-avatar.png';
        if (url.startsWith('http')) return url;
        let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        if (!cleanUrl.startsWith('uploads/')) {
            cleanUrl = `uploads/${cleanUrl}`;
        }
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    const fetchProfileData = async () => {
        setIsLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/');
            return;
        }

        try {
            const userData = await authService.getUserById(userId);
            setUser(userData);
            setEditUsername(userData.username);
            setPreviewUrl(getImageUrl(userData.imgUrl));

            const allPosts = await getPosts();
            const filtered = allPosts
                .filter((post: any) => post.owner?._id === userId)
                .map((post: any) => ({
                    id: post._id,
                    title: post.title,
                    description: post.description,
                    cuisine: post.cuisine,
                    imageUrl: post.imgUrl,
                    calories: post.nutrition?.calories || 0,
                    protein: post.nutrition?.protein || 0,
                    authorName: post.owner?.username || "Me",
                    authorAvatar: post.owner?.imgUrl,
                    likes: Array.isArray(post.likes) ? post.likes.length : 0,
                    isLiked: Array.isArray(post.likes) ? post.likes.includes(userId) : false,
                    comments: post.commentsCount || 0
                }));
            
            setMyPosts(filtered);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Failed to load profile data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [navigate]);

    // --- Added handleLike Logic ---
    const handleLike = async (postId: string) => {
        const userId = localStorage.getItem('userId');
        try {
            const updatedPostFromDB = await toggleLike(postId);

            setMyPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { 
                            ...post, 
                            likes: updatedPostFromDB.likes.length,
                            isLiked: updatedPostFromDB.likes.includes(userId)
                          } 
                        : post
                )
            );
        } catch (err) {
            console.error("Failed to toggle like", err);
            toast.error("Could not update like status.");
        }
    };

    // --- Profile Update Logic ---
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append('username', editUsername);
        if (selectedFile) formData.append('image', selectedFile);

        try {
            // @ts-ignore
            const updatedUser = await authService.updateUser(userId, formData);
            setUser(updatedUser);
            localStorage.setItem('username', updatedUser.username);
            if (updatedUser.imgUrl) localStorage.setItem('imgUrl', updatedUser.imgUrl);
            
            toast.success("Profile updated!");
            setShowEditModal(false);
            fetchProfileData();
        } catch (err) {
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Post Deletion Logic ---
    const openDeleteModal = (id: string) => {
        setPostIdToDelete(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDeletePost = async () => {
        if (!postIdToDelete) return;
        try {
            await deletePost(postIdToDelete);
            setMyPosts(prev => prev.filter(p => p.id !== postIdToDelete));
            toast.success("Recipe deleted");
        } catch (err) {
            toast.error("Failed to delete recipe");
        } finally {
            setShowDeleteModal(false);
            setPostIdToDelete(null);
        }
    };

    if (isLoading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-danger" role="status"></div>
        </div>
    );

    return (
        <div className="container-fluid p-5">
            {/* Confirmation Modals (Delete and Edit) remain the same */}
            {showDeleteModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2001 }}>
                    <div className="bg-white p-4 shadow-lg text-center" style={{ borderRadius: '20px', maxWidth: '400px', width: '90%' }}>
                        <div className="mb-3 text-danger"><i className="bi bi-exclamation-triangle fs-1"></i></div>
                        <h4 className="fw-bold">Delete Recipe?</h4>
                        <p className="text-muted">This will permanently remove your shared recipe. This action cannot be undone.</p>
                        <div className="d-flex gap-2 justify-content-center mt-4">
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-light px-4 fw-bold" style={{ borderRadius: '10px' }}>Cancel</button>
                            <button onClick={handleConfirmDeletePost} className="btn btn-danger px-4 fw-bold" style={{ borderRadius: '10px' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
                    <div className="bg-white p-4 shadow-lg" style={{ borderRadius: '20px', maxWidth: '400px', width: '90%' }}>
                        <h4 className="fw-bold mb-4">Edit Profile</h4>
                        <form onSubmit={handleSaveProfile}>
                            <div className="text-center mb-4 position-relative">
                                <img 
                                    src={previewUrl || '/default-avatar.png'} 
                                    className="rounded-circle border p-1" 
                                    width="100" height="100" 
                                    style={{ objectFit: 'cover' }} 
                                />
                                <label className="btn btn-sm btn-light position-absolute bottom-0 start-50 translate-middle-x shadow-sm rounded-circle">
                                    <i className="bi bi-camera"></i>
                                    <input type="file" hidden accept="image/*" onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }} />
                                </label>
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Username</label>
                                <input type="text" className="form-control bg-light border-0" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-light flex-grow-1 fw-bold" onClick={() => setShowEditModal(false)} style={{ borderRadius: '10px' }}>Cancel</button>
                                <button type="submit" className="btn text-white flex-grow-1 fw-bold" disabled={isSaving} style={{ backgroundColor: '#e81e61', borderRadius: '10px' }}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-5">
                <h2 className="fw-bold" style={{ color: '#e81e61' }}>My Profile</h2>
                <p className="text-muted">Manage your recipes and profile settings</p>
            </div>

            <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '20px' }}>
                <div className="d-flex align-items-center flex-wrap gap-4">
                    <img src={getImageUrl(user?.imgUrl)} alt="Profile" className="rounded-circle border p-1" width="120" height="120" style={{ objectFit: 'cover' }} />
                    <div>
                        <h3 className="fw-bold mb-1">{user?.username}</h3>
                        <p className="mb-1" style={{ color: '#e81e61' }}>{myPosts.length} recipes</p>
                        <p className="text-muted mb-3">{user?.email}</p>
                        <button className="btn btn-outline-danger btn-sm px-4 rounded-pill" onClick={() => setShowEditModal(true)}>
                            <i className="bi bi-gear me-2"></i> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <hr className="mb-5 opacity-25" />
            <h4 className="fw-bold mb-4">My Shared Recipes</h4>

            {myPosts.length === 0 ? (
                <div className="text-center py-5 bg-white shadow-sm rounded-4 border border-light mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="mb-4 text-muted">
                        <i className="bi bi-journal-text display-1 opacity-25"></i>
                        <p className="mt-3 fs-5">You haven't posted any recipes yet</p>
                    </div>
                    <button className="btn text-white px-5 py-3 fw-bold shadow-sm" style={{ backgroundColor: '#e81e61', borderRadius: '15px' }} onClick={() => navigate('/home/create')}>
                        Create Your First Recipe
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {myPosts.map(post => (
                        <div className="col-12 col-md-6 col-lg-4 position-relative" key={post.id}>
                            <div className="position-absolute top-0 end-0 m-4 d-flex gap-2" style={{ zIndex: 10 }}>
                                <button 
                                    className="btn btn-light btn-sm shadow-sm rounded-circle" 
                                    onClick={() => navigate(`/home/edit/${post.id}`)}
                                    title="Edit Recipe"
                                >
                                    <i className="bi bi-pencil-square text-primary"></i>
                                </button>
                                <button 
                                    className="btn btn-light btn-sm shadow-sm rounded-circle" 
                                    onClick={() => openDeleteModal(post.id)}
                                    title="Delete Recipe"
                                >
                                    <i className="bi bi-trash3 text-danger"></i>
                                </button>
                            </div>
                            {/* FIX: Pass handleLike here instead of empty function */}
                            <PostCard {...post} onLike={handleLike} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;