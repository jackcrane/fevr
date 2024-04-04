import React, { useEffect, useState } from "react";
import CalendarView from "./CalendarView";
import moment from "moment";
import styled from "styled-components";

const Nav = styled.div`
  background-color: #1a1c1d;
  height: 50px;
  padding: 10px;
`;
const HeaderText = styled.h1`
  color: #c5c5c5;
  margin: 0;
`;

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
              text: "Calc",
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
          <Nav>
            <HeaderText>Calendar View</HeaderText>
          </Nav>
          <CalendarView data={data.data} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};
