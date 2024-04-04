import React, { useEffect, useState } from "react";
import CalendarView from "./CalendarView";
import moment from "moment";
import styled from "styled-components";
import { FilterEngineer } from "./FilterEngineer";

const Nav = styled.div`
  background-color: #1a1c1d;
  height: 50px;
  padding: 10px;
`;
const HeaderText = styled.h1`
  color: #c5c5c5;
  margin: 0;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
`;
const CalendarContainer = styled.div`
  flex: 1;
  min-height: 100vh;
`;

export default () => {
  const [data, setData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({
    name: [
      {
        text: "Calculus i",
        style: "equals",
      },
    ],
  });

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:2000/course", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      const results = await response.json();
      setData(results);
    })();
  }, [filters]);

  return (
    <>
      {data ? (
        <div>
          <Nav>
            <HeaderText>Calendar View</HeaderText>
          </Nav>
          <Row>
            <CalendarContainer>
              {data.data.length === 0 ? (
                <p>No courses found</p>
              ) : (
                <CalendarView
                  data={data.data}
                  setSelectedCourse={setSelectedCourse}
                />
              )}
            </CalendarContainer>
            <FilterEngineer
              filters={filters}
              setFilters={setFilters}
              selectedCourse={selectedCourse}
            />
          </Row>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};
