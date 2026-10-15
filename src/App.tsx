import { useEffect, useState } from "react";

import { supabase } from "./lib/supabaseClient";
import type { Tables } from "./types/supabase";

function App() {
  type Participant = Tables<"participants">;

  const [participants, setParticipants] = useState<Participant[]>([]);

  async function getParticipants() {
    const { data, error } = await supabase.from("participants").select();

    if (error) {
      console.error(error);
      return;
    }

    setParticipants(data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getParticipants();
  }, []);

  return (
    <div>
      <h1>Participants</h1>
      {participants.map((participant) => (
        <>
          <h2>{participant.participant_id}</h2>
          <p>
            joined at {participant.join_time}
            {participant.consent_status ? "yes" : "no"}
          </p>
        </>
      ))}
    </div>
  );
}

export default App;
