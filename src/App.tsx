import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CompleteView from "./views/CompleteView";
import JoinView from "./views/JoinView";
import VoteView from "./views/VoteView";
import "./App.css";

function App() {
  const [scrollVote, setScrollVote] = useState(false);
  const [likeVote, setLikeVote] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/join" replace />} />
        <Route path="/join" element={<JoinView />} />
        <Route
          path="/vote"
          element={
            <VoteView
              scrollVote={scrollVote}
              likeVote={likeVote}
              onScrollVoteChange={setScrollVote}
              onLikeVoteChange={setLikeVote}
            />
          }
        />
        <Route path="/complete" element={<CompleteView />} />
        <Route path="*" element={<Navigate to="/join" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
