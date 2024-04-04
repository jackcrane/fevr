import React from "react";
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  differenceInCalendarDays,
} from "date-fns";
import styled from "styled-components";

const randomPastel = () => {
  let r = 360 * Math.random();
  return [
    "hsla(" + r + ", 100%, 50%, 0.05)",
    "hsla(" + r + ", 100%, 50%, 0.5)",
    "hsla(" + r + ", 100%, 50%, 0.15)",
  ];
};

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  height: 100%;
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
const WeekLabel = styled.div`
  position: absolute;
  top: 0;
  left: ${(props) => props.offset}%;
  transform: translateX(-100%);
  color: #939393; /* Adjust the color as needed */
  font-size: 14px; /* Adjust the font size as needed */
`;
const CalendarBar = styled.div`
  background-color: ${(props) => props.color[0]};
  border: 1px solid ${(props) => props.color[1]};
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${(props) => props.color[2]};
  }
  border-radius: 5px;
  height: calc(100% - 6px);
  width: calc(${(props) => props.dayLength}% - 2px);
  /* padding-left: 10px;
  padding-right: 10px; */
  margin-left: ${(props) => props.startOffset}%;
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
`;
const Between = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;
const Padded = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
`;
const CalendarText = styled.p`
  font-size: 14px;
  margin: 0;
`;
const Vspacer = styled.div`
  height: 30px;
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

const CalendarView = ({ data, setSelectedCourse }) => {
  const { earliestStartDate, latestEndDate } = findDateExtremes(data);
  const startOfWeekDate = startOfWeek(new Date(earliestStartDate), {
    weekStartsOn: 0,
  });
  const overallCalendarLength =
    differenceInCalendarDays(new Date(latestEndDate), startOfWeekDate) + 1;

  return (
    <Calendar>
      {[...Array(Math.ceil(overallCalendarLength / 7)).keys()].map((week) => (
        <>
          <WeeklyLine
            key={`line-${week}`}
            offset={((week * 7) / overallCalendarLength) * 100}
          />
          <WeekLabel
            key={`label-${week}`}
            offset={((week * 7 + 3.5) / overallCalendarLength) * 100} // Center the label in the middle of the week
          >
            {format(addDays(startOfWeekDate, week * 7), "M/d")}
          </WeekLabel>
        </>
      ))}
      <Vspacer />
      {data?.map((course) => (
        <CalendarRow key={course.id}>
          <CalendarEntry
            setSelectedCourse={setSelectedCourse}
            dayOffset={differenceInCalendarDays(
              new Date(course.registrationStart),
              startOfWeekDate
            )}
            overallCalendarLength={overallCalendarLength}
            dayLength={
              differenceInCalendarDays(
                new Date(course.registrationEnd),
                new Date(course.registrationStart)
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
  setSelectedCourse,
}) => {
  return (
    <CalendarBar
      startOffset={(dayOffset / overallCalendarLength) * 100}
      dayLength={(dayLength / overallCalendarLength) * 100}
      color={randomPastel()}
      onClick={() => setSelectedCourse(course)}
    >
      <Padded>
        <Between>
          <CalendarText>
            {course.name} @ {course.university.shortName} ({course.code})
          </CalendarText>
          <CalendarText>
            {format(parseISO(course.registrationStart), "EEE, MMM d, yyyy")} -{" "}
            {format(parseISO(course.registrationEnd), "EEE, MMM d, yyyy")}
          </CalendarText>
        </Between>
      </Padded>
    </CalendarBar>
  );
};

export default CalendarView;
