import moment from "moment";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const EngineerContainer = styled.div`
  background-color: #1a1c1d;
  min-height: 100vh;
  width: 450px;
  padding: 10px;
`;
const H2 = styled.h2`
  color: #c5c5c5;
  margin: 0;
`;
const FilterContainer = styled.div`
  border: 1px solid #363636;
  border-radius: 5px;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
`;
const Select = styled.select`
  background-color: #1a1c1d;
  color: #c5c5c5;
  border: 1px solid #363636;
  border-radius: 5px;
  box-sizing: border-box;
  padding: 5px;
  margin-right: 5px;
  &:focus {
    outline: none;
  }
`;
const Input = styled.input`
  background-color: #1a1c1d;
  color: #c5c5c5;
  border: 1px solid #363636;
  border-radius: 5px;
  box-sizing: border-box;
  padding: 5px;
  margin-right: 5px;
  flex: 1;
  &:focus {
    outline: none;
    border: 1px solid #e1e1e1;
  }
`;
const Button = styled.button`
  background-color: #1a1c1d;
  color: #c5c5c5;
  border: 1px solid #363636;
  border-radius: 5px;
  box-sizing: border-box;
  padding: 5px;
  margin-right: 5px;
  &:focus {
    outline: none;
  }
  cursor: pointer;
`;
const Hr = styled.hr`
  border: 1px solid #363636;
`;

function reformatArray(array) {
  const result = {};

  array.forEach((item) => {
    const { field, text, style } = item;

    if (field === "registrationStart" || field === "registrationEnd") {
      // Handle date fields differently
      result[field] = { date: text, direction: style };
    } else {
      if (!result[field]) {
        result[field] = [];
      }
      result[field].push({ text, style });
    }
  });

  return result;
}

function reformatBackToObject(structuredData) {
  const resultArray = [];

  Object.keys(structuredData).forEach((field) => {
    if (field === "registrationStart" || field === "registrationEnd") {
      // Handle date fields differently
      resultArray.push({
        field,
        text: structuredData[field].date,
        style: structuredData[field].direction,
      });
    } else {
      structuredData[field].forEach((item) => {
        resultArray.push({ field, text: item.text, style: item.style });
      });
    }
  });

  return resultArray;
}

export const FilterEngineer = ({ filters, setFilters, selectedCourse }) => {
  const [filter, setFilter] = useState([]);

  useEffect(() => {
    setFilter(reformatBackToObject(filters));
  }, [filters]);

  return (
    <EngineerContainer>
      <H2>Filter Engineer</H2>
      {filter.map((f, i) => (
        <FilterContainer key={i}>
          <Select
            value={f.field}
            onChange={(e) => {
              const newFilter = [...filter];
              const value = e.target.value;
              // If switching to a date type, reset text and style
              if (
                value === "registrationStart" ||
                value === "registrationEnd"
              ) {
                newFilter[i] = {
                  ...newFilter[i],
                  field: value,
                  text: "",
                  style: "gt",
                };
              } else {
                newFilter[i].field = value;
              }
              setFilter(newFilter);
            }}
          >
            <option value="name">Course name</option>
            <option value="code">Course code</option>
            <option
              value="registrationStart"
              disabled={filter.some((f) => f.field === "registrationStart")}
            >
              Registration Start
            </option>
            <option
              value="registrationEnd"
              disabled={filter.some((f) => f.field === "registrationEnd")}
            >
              Registration End
            </option>
          </Select>
          {f.field === "registrationStart" || f.field === "registrationEnd" ? (
            <Select
              value={f.style}
              onChange={(e) => {
                const newFilter = [...filter];
                newFilter[i].style = e.target.value;
                setFilter(newFilter);
              }}
            >
              <option value="gt">Greater than</option>
              <option value="lt">Less than</option>
            </Select>
          ) : (
            <Select
              value={f.style}
              onChange={(e) => {
                const newFilter = [...filter];
                newFilter[i].style = e.target.value;
                setFilter(newFilter);
              }}
            >
              <option value="equals">equals</option>
              <option value="contains">contains</option>
              <option value="startsWith">startsWith</option>
              <option value="endsWith">endsWith</option>
            </Select>
          )}
          <Input
            type={
              f.field === "registrationStart" || f.field === "registrationEnd"
                ? "date"
                : "text"
            }
            value={f.text}
            onChange={(e) => {
              const newFilter = [...filter];
              newFilter[i].text = e.target.value;
              setFilter(newFilter);
            }}
          />
          {filter.length > 1 ? (
            <Button
              onClick={() => {
                const newFilter = [...filter];
                newFilter.splice(i, 1);
                setFilter(newFilter);
              }}
            >
              Remove
            </Button>
          ) : null}
        </FilterContainer>
      ))}

      <Button
        onClick={() => {
          setFilter([
            ...filter,
            {
              field: "name",
              text: "",
              style: "equals",
            },
          ]);
        }}
      >
        Add new filter
      </Button>
      <Button
        onClick={() => {
          setFilters(reformatArray(filter));
        }}
      >
        Apply filters
      </Button>
      {selectedCourse ? (
        <>
          <Hr />
          <H2>Selected Course</H2>
          <table>
            <tbody>
              <tr>
                <td>Course name:</td>
                <td>{selectedCourse.name}</td>
              </tr>
              <tr>
                <td>Course code:</td>
                <td>{selectedCourse.code}</td>
              </tr>
              <tr>
                <td>University:</td>
                <td>{selectedCourse.university.fullName}</td>
              </tr>
              <tr>
                <td>CRN:</td>
                <td>{selectedCourse.crn}</td>
              </tr>
              <tr>
                <td>Section:</td>
                <td>{selectedCourse.section}</td>
              </tr>
              <tr>
                <td>Link:</td>
                <td>
                  <a
                    href={selectedCourse.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#c5c5c5",
                    }}
                  >
                    Link
                  </a>
                </td>
              </tr>
              <tr>
                <td>Registration start:</td>
                <td>
                  {moment(selectedCourse.registrationStart).format("M/D")}
                </td>
              </tr>
              <tr>
                <td>Registration end:</td>
                <td>{moment(selectedCourse.registrationEnd).format("M/D")}</td>
              </tr>
              <tr>
                <td>Levels:</td>
                <td>{selectedCourse.levels}</td>
              </tr>
              <tr>
                <td>Attributes:</td>
                <td>{selectedCourse.attributes}</td>
              </tr>
              <tr>
                <td>Term:</td>
                <td>{selectedCourse.term}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <></>
      )}
    </EngineerContainer>
  );
};
