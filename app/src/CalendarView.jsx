import React from "react";
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import moment from "moment";
import styled from "styled-components";

const randomPastel = () => {
  return "hsla(" + 360 * Math.random() + ", 100%, 50%, 0.15)";
};

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const CalendarRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-bottom: 1px solid #363636;
  height: 35px;
  position: relative;
`;
const WeeklyLine = styled.div`
  position: absolute;
  height: 100%;
  width: 1px; /* Adjust the width as needed */
  background-color: #363636; /* Adjust the color as needed */
  left: ${(props) => props.offset}%;
`;
const CalendarBar = styled.div`
  background-color: ${(props) => props.color};
  height: calc(100% - 4px);
  width: calc(${(props) => props.dayLength}% - 20px);
  padding-left: 10px;
  padding-right: 10px;
  margin-left: ${(props) => props.startOffset}%;
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
`;
const CalendarText = styled.p`
  font-size: 14px;
  margin: 0;
`;

const findDateExtremes = (data) => {
  let earliestStartDate = data[0].registrationStart;
  let latestEndDate = data[0].registrationEnd;

  // Loop through each item in the data array
  data.forEach((item) => {
    // Compare and find the earliest registrationStart date
    if (new Date(item.registrationStart) < new Date(earliestStartDate)) {
      earliestStartDate = item.registrationStart;
    }

    // Compare and find the latest registrationEnd date
    if (new Date(item.registrationEnd) > new Date(latestEndDate)) {
      latestEndDate = item.registrationEnd;
    }
  });

  // Return the found dates
  return {
    earliestStartDate,
    latestEndDate,
  };
};

const CalendarView = ({ data }) => {
  const { earliestStartDate, latestEndDate } = findDateExtremes(data);
  const overallCalendarLength = moment(latestEndDate).diff(
    moment(earliestStartDate),
    "days"
  );

  return (
    <Calendar>
      {/* Add a weekly line every week */}
      {[...Array(Math.floor(overallCalendarLength / 7)).keys()].map((week) => (
        <WeeklyLine
          key={week}
          offset={((week * 7) / overallCalendarLength) * 100}
        ></WeeklyLine>
      ))}
      {data?.map((course) => (
        <CalendarRow key={course.id}>
          <CalendarEntry
            // Number of days of this course's start date from the earliest start date
            dayOffset={moment(course.registrationStart).diff(
              moment(findDateExtremes(data).earliestStartDate),
              "days"
            )}
            overallCalendarLength={overallCalendarLength}
            // Number of days between this course's start and end dates
            dayLength={
              moment(course.registrationEnd).diff(
                moment(course.registrationStart),
                "days"
              ) + 1
            }
            course={course}
          />
        </CalendarRow>
      ))}
    </Calendar>
  );
};

const CalendarEntry = ({
  dayOffset,
  overallCalendarLength,
  dayLength,
  course,
}) => {
  return (
    // <p>
    //   {dayOffset}
    //   <br />
    //   {(dayOffset / overallCalendarLength) * 100}
    // </p>
    <CalendarBar
      startOffset={(dayOffset / overallCalendarLength) * 100}
      dayLength={(dayLength / overallCalendarLength) * 100}
      color={randomPastel()}
    >
      <CalendarText>
        {course.name} @ {course.university.shortName} ({course.code})
      </CalendarText>
    </CalendarBar>
  );
};

export default CalendarView;
