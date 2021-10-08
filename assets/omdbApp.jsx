const Pagination = ({ items, pageSize, onPageChange }) => {
  console.log("Pagination")
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil((items.length / pageSize) -1);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  console.log("Range")
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  console.log("Paginate")
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  console.log("useDataApi")
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
  

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    console.log("useEffect")
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  console.log("dataFetchReducer")
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

function App() {
  console.log("App")
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState('b4b67947');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    `https://www.omdbapi.com/?apikey=${apiKey}&s=Atlantis`,
    {
      Search: []
    }
  );
  const handlePageChange = e => {
    console.log("handlePageChange")
    setCurrentPage(Number(e.target.textContent));
    
  };
  let page = data.Search;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  return (
    <Fragment>
      <div className="input-group mb-3 input-form">
      <form
        onSubmit={event => {
          console.log("onSubmit doFetch");
          doFetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`);

          event.preventDefault();
        }}
      >
        <h4>Search for movies and TV shows</h4>
        <input
          type="text"
          className="form-control"
          placeholder="Atlantis..."
          aria-describedby="search-submit"
          value={query}
          onChange={event => setQuery(event.target.value)}
          />
          <h4>Enter Results Per Page</h4>
          <input
          label="Results per page"
          type="number"
          className="form-control"
          
          aria-describedby="search-submit"
          value={pageSize}
          onChange={event => setPageSize(event.target.value)}
          />
        <button className="btn btn-outline-secondary submit-btn" type="submit" id="search-submit">Search</button>
      </form>
      </div>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group">
          {page.map((item, i) => (
            <li className="list-group-item" key={i}>
              <img src={item.Poster} alt="Image not available" className="rounded img-fluid img-thumbnail mx-auto d-block"/><br/>
              <h3>{item.Title}</h3>
              <a href={"https://www.imdb.com/title/" + item.imdbID} ><div><p>View this {item.Type} on IMDB</p></div></a>
              <div><p>Released: {item.Year}</p></div>
              </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.Search}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
