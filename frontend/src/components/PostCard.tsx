import { useNavigate } from 'react-router-dom';

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

    // handle like button
    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // stops the click from propagating to the card's onClick which navigates to the post page
        onLike(id);
    };

    return (
        <div 
            className="card h-100 border-0 shadow-sm post-card-hover" 
            style={{ borderRadius: '16px', overflow: 'hidden' }}
            onClick={() => navigate(`/post/${id}`)}
        >
            {/* owner details */}
            <div className="card-body d-flex align-items-center pb-2">
                <img src={authorAvatar} alt={authorName} className="rounded-circle me-3" width="40" height="40" />
                <div>
                    <h6 className="mb-0 fw-bold">{authorName}</h6>
                    <small style={{ color: '#e81e61' }}>{cuisine}</small>
                </div>
            </div>

            <img src={imageUrl} alt={title} style={{ height: '220px', objectFit: 'cover', width: '100%' }} />
            
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
                <p className="card-text text-muted small mb-4">{description}</p>
                
                <div className="mt-auto d-flex gap-2">
                    <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: '#fcf0f4', color: '#e81e61' }}>
                        {calories} cal
                    </span>
                    <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: '#fcf0f4', color: '#e81e61' }}>
                        {protein} protein
                    </span>
                </div>
            </div>
        </div>
    );
}

export default PostCard;