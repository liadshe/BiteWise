import { useState, useEffect } from 'react';

function HomePage() {
    // define state variables
    const [recipes, setRecipes] = useState([]); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [cuisineFilter, setCuisineFilter] = useState(''); 
    const [page, setPage] = useState(1); 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null); 

    // get recipes from backend
    useEffect(() => {
        // add logic here to fetch recipes based on searchQuery, cuisineFilter, and page
        console.log('Fetching recipes for page:', page);
    }, [page, cuisineFilter, searchQuery]); 

    // return JSX for the home page
    return (
        <>
            <div className="container mt-4">
                <h1>BiteWise - Discover & Track</h1>
                
                {/* filter by cusine + search */}
                <div className="d-flex justify-content-between mb-4">
                    {/* <SearchBar onSearch={setSearchQuery} /> */}
                    {/* <FilterBar onFilter={setCuisineFilter} /> */}
                </div>

                {/* hendeling errors and loading state */}
                {error && <div className="alert alert-danger m-3">{error}</div>}
                {isLoading && <p>Loading recipes...</p>}

                {/* recepies list */}
                {/* <RecipeList recipes={recipes} /> */}
            </div>
        </>
    );
}

export default HomePage;