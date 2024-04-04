import React, { useEffect, useState } from "react";
import CalendarView from "./CalendarView";
import moment from "moment";

export default () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:2000/course", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: [
            {
              text: "f",
              style: "startsWith",
            },
          ],
        }),
      });
      const results = await response.json();
      setData(results);
    })();
  }, []);

  return (
    <>
      {data ? (
        <div>
          <h2>Calendar View</h2>
          <CalendarView data={data.data} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};
