import { CalendarDays, ChevronDown, ChevronUp, Clock3 } from "lucide-react";
import { FC, useState } from "react";
import { UI_CATEGORY } from "../../../utils/os/ui/uiCategories";

type TimePanelProps = {
  date: Date;
};

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function sameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getCalendarCells(viewDate: Date, today: Date, selectedDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);

    return {
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === month,
      isToday: sameDay(cellDate, today),
      isSelected: sameDay(cellDate, selectedDate) && !sameDay(cellDate, today),
    };
  });
}

function getLocalDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getMonthDate(date: Date, offset: number) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return new Date(year, month + offset, 1);
}

const TimePanel: FC<TimePanelProps> = ({ date }) => {
  const [viewDate, setViewDate] = useState(() => new Date(date));
  const [selectedDate, setSelectedDate] = useState(() => new Date(date));
  const calendarCells = getCalendarCells(viewDate, date, selectedDate);
  const monthLabel = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(viewDate);
  const dayLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

  return (
    <section
      id="clock-panel"
      className="panel clock-panel"
      data-ui-category={UI_CATEGORY.panel}
      aria-label="Calendar and clock"
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="clock-panel__time-card">
        <Clock3 size={20} />
        <div>
          <span>Uhrzeit</span>
          <strong>{timeLabel}</strong>
          <small>{dayLabel}</small>
        </div>
      </div>

      <div className="clock-panel__calendar-card">
        <div className="clock-panel__calendar-header">
          <div>
            <CalendarDays size={18} />
            <strong>{monthLabel}</strong>
          </div>
          <div className="clock-panel__month-controls">
            <button
              type="button"
              aria-label="Previous month"
              title="Previous month"
              onClick={() => setViewDate((current) => getMonthDate(current, -1))}
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              aria-label="Next month"
              title="Next month"
              onClick={() => setViewDate((current) => getMonthDate(current, 1))}
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
        <div className="clock-panel__weekdays" aria-hidden="true">
          {weekdayLabels.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="clock-panel__calendar-grid">
          {calendarCells.map((cell) => (
            <button
              key={getLocalDateKey(cell.date)}
              type="button"
              className={[
                !cell.isCurrentMonth ? "clock-panel__day--muted" : "",
                cell.isSelected ? "clock-panel__day--selected" : "",
                cell.isToday ? "clock-panel__day--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={new Intl.DateTimeFormat("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(cell.date)}
              aria-pressed={sameDay(cell.date, selectedDate)}
              onClick={() => {
                setSelectedDate(new Date(cell.date));
                setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
              }}
            >
              {cell.date.getDate()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

TimePanel.displayName = "TimePanel";

export default TimePanel;
