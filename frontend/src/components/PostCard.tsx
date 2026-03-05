import { useNavigate } from 'react-router-dom';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PostProps {
    id: string;
    title: string;
    description: string;
    cuisine: string;
    calories: number;
    protein: number;
    imageUrl: string;
    authorName: string;
    authorAvatar: string;
    likes: number;
    isLiked: boolean;
    comments: number;
    onLike: (id: string) => void;
}

function PostCard({ id, title, description, cuisine, calories, protein, imageUrl, authorName, authorAvatar, likes, isLiked, comments, onLike }: PostProps) {
    const navigate = useNavigate(); 

    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/default-avatar.png'; // fallback if user has no image at all
        if (url.startsWith('http')) return url; // handles Google Auth images
        
        let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        if (!cleanUrl.startsWith('uploads/')) {
            cleanUrl = `uploads/${cleanUrl}`;
        }
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    // handle like button
    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onLike(id);
    };

    return (
        <div 
            className="card h-100 border-0 shadow-sm post-card-hover" 
            style={{ borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }} 
            onClick={() => navigate(`/home/post/${id}`)}
        >
            {/* owner details */}
            <div className="card-body d-flex align-items-center pb-2">
                <img 
                    src={getImageUrl(authorAvatar)} 
                    alt={authorName} 
                    className="rounded-circle me-3 shadow-sm" 
                    width="40" 
                    height="40" 
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png'; 
                    }}
                />
                <div>
                    <h6 className="mb-0 fw-bold">{authorName}</h6>
                    <small style={{ color: '#e81e61' }}>{cuisine}</small>
                </div>
            </div>

            {/* Main Recipe Image */}
            <img 
                src={getImageUrl(imageUrl)} 
                alt={title} 
                style={{ height: '220px', objectFit: 'cover', width: '100%' }} 
            />
            
            <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-2">
                    <span style={{ cursor: 'pointer', color: '#e81e61', zIndex: 2, position: 'relative' }} onClick={handleLikeClick}>
                        <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i> {likes}
                    </span>
                    <span className="text-muted">
                        <i className="bi bi-chat me-1"></i> {comments}
                    </span>
                </div>

                <h5 className="card-title fw-bold mt-2">{title}</h5>
                <p className="card-text text-muted small mb-4" style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                }}>
                    {description}
                </p>
                
                <div className="mt-auto d-flex gap-2">
                    <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: '#fcf0f4', color: '#e81e61' }}>
                        {calories} cal
                    </span>
                    <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: '#fcf0f4', color: '#e81e61' }}>
                        {protein}g protein
                    </span>
                </div>
            </div>
        </div>
    );
}

export default PostCard;