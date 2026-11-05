import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ParticipantAuthProvider } from "./components/ParticipantAuthProvider";
import { ParticipantSessionRoutes } from "./components/ParticipantSessionRoutes";
import { RequireParticipantAuth } from "./components/RequireParticipantAuth";
import CompleteView from "./views/CompleteView";
import JoinView from "./views/JoinView";
import VoteView from "./views/VoteView";
import "./App.css";

function App() {
  return (
    <ParticipantAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/join" replace />} />
          <Route path="/join" element={<JoinView />} />
          <Route element={<RequireParticipantAuth />}>
            <Route element={<ParticipantSessionRoutes />}>
              <Route path="/vote" element={<VoteView />} />
              <Route path="/complete" element={<CompleteView />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/join" replace />} />
        </Routes>
      </BrowserRouter>
    </ParticipantAuthProvider>
  );
}

export default App;
