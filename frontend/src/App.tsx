import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SpotifyCallback } from "./SpotifyCallback.tsx";

function App() {
  const fetchApp = async () => {
    const response = await fetch(`/api/test`);
    const data = await response.json();
    console.log(data);
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/callback"} element={<SpotifyCallback />} />
        <Route
          path={"/"}
          element={
            <>
              <a href={"http://localhost:4000/login"}>Login to Spotify</a>
              <button onClick={fetchApp}>Fetch</button>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
