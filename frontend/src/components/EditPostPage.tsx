import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updatePost, getPostById, analyzeRecipe } from '../services/postService';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cuisine, setCuisine] = useState('Mediterranean');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    // Dynamic Arrays
    const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
    const [instructions, setInstructions] = useState(['']);
    
    // AI Result
    const [nutritionResult, setNutritionResult] = useState<any>(null);

    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        if (!cleanUrl.startsWith('uploads/')) cleanUrl = `uploads/${cleanUrl}`;
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    // --- Fetch Existing Data ---
    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const post = await getPostById(id);
                
                // Pre-fill the form fields
                setTitle(post.title || '');
                setDescription(post.description || '');
                setCuisine(post.cuisine || 'Mediterranean');
                
                if (post.ingredients && post.ingredients.length > 0) {
                    setIngredients(post.ingredients);
                }
                if (post.instructions && post.instructions.length > 0) {
                    setInstructions(post.instructions);
                }
                
                setNutritionResult(post.nutrition || null);
                setImagePreview(getImageUrl(post.imgUrl));

            } catch (err) {
                console.error("Failed to fetch post", err);
                toast.error("Failed to load recipe data.");
                navigate('/home');
            } finally {
                setIsFetching(false);
            }
        };

        fetchPost();
    }, [id, navigate]);

    // --- Dynamic List Handlers ---
    const updateIngredient = (index: number, field: string, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };
    const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }]);
    const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

    const updateInstruction = (index: number, value: string) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };
    const addInstruction = () => setInstructions([...instructions, '']);
    const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));

    const handleIngredientKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Tab' && index === ingredients.length - 1) {
            e.preventDefault();
            addIngredient();
        }
    };

    const handleInstructionKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Tab' && index === instructions.length - 1) {
            e.preventDefault();
            addInstruction();
        }
    };

    // Handle Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleAnalyze = async () => {
        if (!title || !description) {
            setError("Please add a title and description before analyzing.");
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        try {
            const result = await analyzeRecipe({ title, description, ingredients, instructions });
            setNutritionResult(result);
            toast.success("Analysis complete!");
        } catch (err) {
            setError("Failed to analyze nutrition.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleUpdate = async () => {
        if (!id) return;
        if (!nutritionResult) {
            setError("Please analyze the recipe before saving changes.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('cuisine', cuisine);
        
        // Only append the image if the user selected a NEW one
        if (imageFile) {
            formData.append('image', imageFile);
        }

        formData.append('ingredients', JSON.stringify(ingredients));
        formData.append('instructions', JSON.stringify(instructions));
        formData.append('nutrition', JSON.stringify(nutritionResult));

        try {
            await updatePost(id, formData);
            toast.success("Recipe updated successfully!");
            navigate(`/home/post/${id}`); 
        } catch (err) {
            setError("Failed to update recipe. Please try again.");
            toast.error("Failed to update.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="p-5 text-center"><div className="spinner-border" style={{color: '#e81e61'}}></div></div>;
    }

    return (
        <div className="container-fluid p-4" style={{ maxWidth: '1200px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted p-0 mb-2 fw-bold d-flex align-items-center">
                        <i className="bi bi-arrow-left me-2"></i> Cancel Editing
                    </button>
                    <h2 className="fw-bold mb-0" style={{ color: '#e81e61' }}>Edit Recipe</h2>
                    <p className="text-muted mb-0">Update your culinary creation</p>
                </div>
            </div>

            {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}

            <div className="row g-4">
                {/* --- LEFT COLUMN: Basics, Image & Analysis --- */}
                <div className="col-lg-5 d-flex flex-column gap-3">
                    
                    {/* Basic Info Card */}
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
                        <div className="mb-3">
                            <label className="form-label text-muted small fw-bold mb-1">Recipe Title</label>
                            <input type="text" className="form-control border-0 bg-light p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pasta in tomato sauce" style={{ borderRadius: '10px' }} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-muted small fw-bold mb-1">Description</label>
                            <textarea className="form-control border-0 bg-light p-2" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe your recipe..." style={{ borderRadius: '10px', resize: 'none' }} />
                        </div>
                        <div>
                            <label className="form-label text-muted small fw-bold mb-1">Cuisine Type</label>
                            <select className="form-select border-0 bg-light p-2" value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={{ borderRadius: '10px' }}>
                                {['Italian', 'Mediterranean', 'Asian', 'Mexican', 'American'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Image Upload Card */}
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
                        <label className="form-label text-muted small fw-bold mb-2">Recipe Image (Click to change)</label>
                        <div 
                            className="border border-dashed d-flex flex-column justify-content-center align-items-center position-relative overflow-hidden" 
                            style={{ borderColor: '#e81e61', borderRadius: '12px', height: '180px', backgroundColor: '#fdf3f6', cursor: 'pointer' }}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div className="text-center" style={{ color: '#e81e61' }}>
                                    <i className="bi bi-cloud-arrow-up fs-3"></i>
                                    <div className="small fw-bold">Click to upload image</div>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* AI Analysis & Update Section */}
                    <div className="card border-0 shadow-sm p-4 mt-auto" style={{ borderRadius: '16px', backgroundColor: '#fff5f8' }}>
                        <h6 style={{ color: '#e81e61' }} className="fw-bold mb-3"><i className="bi bi-stars"></i> Nutritional Analysis</h6>
                        
                        {!nutritionResult ? (
                            <button className="btn text-white w-100 py-2 fw-bold" style={{ backgroundColor: '#e81e61', borderRadius: '10px' }} onClick={handleAnalyze} disabled={isAnalyzing}>
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Nutrition'}
                            </button>
                        ) : (
                            <div>
                                <div className="d-flex gap-2 mb-3">
                                    <div className="bg-white p-2 rounded shadow-sm text-center flex-fill">
                                        <h5 className="fw-bold mb-0 text-dark">{nutritionResult.calories}</h5>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Calories</small>
                                    </div>
                                    <div className="bg-white p-2 rounded shadow-sm text-center flex-fill">
                                        <h5 className="fw-bold mb-0 text-dark">{nutritionResult.protein}g</h5>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Protein</small>
                                    </div>
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}><strong>Tip:</strong> {nutritionResult.suggestions}</p>
                                
                                <button className="btn btn-success w-100 py-2 fw-bold shadow-sm" style={{ borderRadius: '10px' }} onClick={handleUpdate} disabled={isLoading}>
                                    <i className="bi bi-check-circle me-2"></i>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <div className="text-center mt-2">
                                    <button className="btn btn-link btn-sm text-muted text-decoration-none" onClick={() => setNutritionResult(null)}>Edit & Re-analyze</button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* --- RIGHT COLUMN: Ingredients & Instructions --- */}
                <div className="col-lg-7 d-flex flex-column gap-3">
                    
                    {/* Ingredients Section */}
                    <div className="card border-0 shadow-sm p-4 d-flex flex-column" style={{ borderRadius: '16px', flex: '1' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0" style={{ color: '#e81e61' }}>Ingredients</h6>
                            <button className="btn btn-sm text-danger border border-danger bg-white" onClick={addIngredient} style={{ borderRadius: '8px' }}>+ Add</button>
                        </div>
                        
                        <div className="pe-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {ingredients.map((ing, idx) => (
                                <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                                    <input type="text" className="form-control form-control-sm border-0 bg-light p-2" placeholder="Ingredient name" value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)} style={{ borderRadius: '8px' }} />
                                    <input type="text" className="form-control form-control-sm border-0 bg-light p-2 w-25" placeholder="Amount" value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', e.target.value)} onKeyDown={(e) => handleIngredientKeyDown(e, idx)} style={{ borderRadius: '8px' }} />                                    
                                    <button className="btn btn-sm text-danger border-0" onClick={() => removeIngredient(idx)}><i className="bi bi-x-lg"></i></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="card border-0 shadow-sm p-4 d-flex flex-column" style={{ borderRadius: '16px', flex: '1' }}>
                         <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0" style={{ color: '#e81e61' }}>Instructions</h6>
                            <button className="btn btn-sm text-danger border border-danger bg-white" onClick={addInstruction} style={{ borderRadius: '8px' }}>+ Add</button>
                        </div>

                        <div className="pe-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {instructions.map((inst, idx) => (
                                <div key={idx} className="d-flex gap-2 mb-2 align-items-start">
                                    <span className="fw-bold mt-2" style={{ color: '#e81e61', width: '20px' }}>{idx + 1}.</span>
                                    <textarea className="form-control form-control-sm border-0 bg-light p-2" rows={2} placeholder="Describe this step..." value={inst} onChange={(e) => updateInstruction(idx, e.target.value)} onKeyDown={(e) => handleInstructionKeyDown(e, idx)} style={{ borderRadius: '8px', resize: 'none' }} />                                    
                                    <button className="btn btn-sm text-danger border-0 mt-1" onClick={() => removeInstruction(idx)}><i className="bi bi-x-lg"></i></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default EditPostPage;