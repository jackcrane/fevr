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
    // Extract field, text, and style from each item
    const { field, text, style } = item;

    // Check if the result object already has the field as a key
    if (!result[field]) {
      result[field] = [];
    }

    // Push the text and style as an object into the appropriate array
    result[field].push({ text, style });
  });

  return result;
}

function reformatBackToObject(structuredData) {
  const resultArray = [];

  // Iterate through each key in the structured data object
  Object.keys(structuredData).forEach((field) => {
    // For each item in the array associated with this key...
    structuredData[field].forEach((item) => {
      // Push a new object to the resultArray, including the field
      resultArray.push({
        field: field,
        text: item.text,
        style: item.style,
      });
    });
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
            onChange={(e) => {
              const newFilter = [...filter];
              newFilter[i].field = e.target.value;
              setFilter(newFilter);
            }}
          >
            <option value="name" selected={f.field === "name"}>
              Course name
            </option>
            <option value="code" selected={f.field === "code"}>
              Course code
            </option>
          </Select>
          <Select
            onChange={(e) => {
              const newFilter = [...filter];
              newFilter[i].style = e.target.value;
              setFilter(newFilter);
            }}
          >
            <option value="equals" selected={f.style === "equals"}>
              equals
            </option>
            <option value="contains" selected={f.style === "contains"}>
              contains
            </option>
            <option value="startsWith" selected={f.style === "startsWith"}>
              startsWith
            </option>
            <option value="endsWith" selected={f.style === "endsWith"}>
              endsWith
            </option>
          </Select>
          <Input
            type="text"
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
          ) : (
            <></>
          )}
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

/*

{
            "id": "043665a3-f0b2-4b3d-99b2-2f23743b8e7d",
            "universityId": "47bb0c2e-5476-4dc5-a1af-b69582d925af",
            "link": "https://banner.slu.edu/ssbprd/bwckschd.p_disp_detail_sched?term_in=202500&crn_in=30253",
            "title": "Fundamentals of Project Management - 30253 - PMGT 1010 - 21",
            "name": "Fundamentals of Project Management",
            "crn": "30253",
            "code": "PMGT 1010",
            "section": "21",
            "term": "Summer 2024",
            "registrationStart": "2024-04-02T05:00:00.000Z",
            "registrationEnd": "2024-06-30T05:00:00.000Z",
            "levels": "Undergraduate",
            "attributes": "Summer 2024, Apr 02, 2024 to Jun 30, 2024, Undergraduate, Prof. Studies Students Only, Internet Based / Online Campus, Lecture Schedule Type, 100% Distance - Asynchronous Instructional Method, 3.000 Credits, Class, Jun 17, 2024 - Aug 11, 2024, Lecture, Meegan   McKeethen (, )",
            "createdAt": "2024-04-04T03:07:55.785Z",
            "updatedAt": "2024-04-04T03:07:55.785Z",
            "scannedAt": null
        },

*/
