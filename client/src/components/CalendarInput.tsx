import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type CalendarInputProps =
    | {
          mode: "single";
          value: string;
          onChange: (value: string) => void;
          placeholder?: string;
      }
    | {
          mode: "range";
          startDate: string;
          endDate: string;
          onChange: (startDate: string, endDate: string) => void;
          placeholder?: string;
      };

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthFormatter = new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

const selectionFormatter = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});

function parseDate(value: string) {
    return new Date(`${value}T00:00:00Z`);
}

function toDateValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export default function CalendarInput(props: CalendarInputProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const selectedAnchor = props.mode === "single" ? props.value : props.endDate || props.startDate;
    const [visibleMonth, setVisibleMonth] = useState(() =>
        startOfMonth(selectedAnchor ? parseDate(selectedAnchor) : new Date()),
    );

    const startDate = props.mode === "range" ? props.startDate : props.value;
    const endDate = props.mode === "range" ? props.endDate : props.value;

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!containerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const trigger = triggerRef.current;
            if (!trigger) return;

            const rect = trigger.getBoundingClientRect();
            const viewportPadding = 16;
            const width = Math.min(300, window.innerWidth - viewportPadding * 2);
            const left = Math.min(
                Math.max(rect.right - width, viewportPadding),
                window.innerWidth - width - viewportPadding,
            );
            const estimatedHeight = props.mode === "range" ? 350 : 325;
            const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
            const top = spaceBelow >= estimatedHeight
                ? rect.bottom + 8
                : Math.max(viewportPadding, rect.top - estimatedHeight - 8);

            setPopoverPosition({ top, left, width });
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen, props.mode]);

    const calendarDays = useMemo(() => {
        const firstWeekday = (visibleMonth.getUTCDay() + 6) % 7;
        const gridStart = new Date(visibleMonth);
        gridStart.setUTCDate(1 - firstWeekday);

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(gridStart);
            date.setUTCDate(gridStart.getUTCDate() + index);
            return date;
        });
    }, [visibleMonth]);

    const moveMonth = (offset: number) => {
        setVisibleMonth((month) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + offset, 1)));
    };

    const selectDate = (date: Date) => {
        const selectedDate = toDateValue(date);

        if (props.mode === "single") {
            props.onChange(selectedDate);
            setIsOpen(false);
            return;
        }

        if (!props.startDate || props.endDate) {
            props.onChange(selectedDate, "");
            return;
        }

        if (selectedDate < props.startDate) {
            props.onChange(selectedDate, props.startDate);
        } else {
            props.onChange(props.startDate, selectedDate);
        }
        setIsOpen(false);
    };

    const displayValue = props.mode === "single"
        ? props.value
            ? selectionFormatter.format(parseDate(props.value))
            : props.placeholder ?? "Select date"
        : props.startDate && props.endDate
          ? `${selectionFormatter.format(parseDate(props.startDate))} — ${selectionFormatter.format(parseDate(props.endDate))}`
          : props.startDate
            ? `${selectionFormatter.format(parseDate(props.startDate))} — Select end date`
            : props.placeholder ?? "Select date range";

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left outline-none transition hover:border-blue/40 focus:border-blue focus:ring-2 focus:ring-blue/15 ${startDate ? "border-blue/15 bg-blue/10" : "border-blue/20 bg-white/25"}`}
            >
                <span className={startDate ? "font-medium text-blue" : "text-blue/40"}>{displayValue}</span>
                <CalendarDays className="size-5 shrink-0 text-blue/60" />
            </button>

            {isOpen && popoverPosition && createPortal(
                <div
                    ref={popoverRef}
                    role="dialog"
                    aria-label={props.mode === "range" ? "Choose date range" : "Choose date"}
                    className="fixed z-[1100] rounded-2xl border border-blue/15 bg-light-blue p-3 text-blue shadow-2xl"
                    style={popoverPosition}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => moveMonth(-1)}
                            aria-label="Previous month"
                            className="grid size-8 place-items-center rounded-lg bg-blue/10 transition hover:bg-blue hover:text-light-blue"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <p className="font-ferrite text-sm uppercase tracking-wider">{monthFormatter.format(visibleMonth)}</p>
                        <button
                            type="button"
                            onClick={() => moveMonth(1)}
                            aria-label="Next month"
                            className="grid size-8 place-items-center rounded-lg bg-blue/10 transition hover:bg-blue hover:text-light-blue"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    <div className="mb-2 grid grid-cols-7 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-blue/50">
                        {weekdays.map((weekday) => (
                            <span key={weekday} className="py-1">{weekday}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1">
                        {calendarDays.map((date) => {
                            const value = toDateValue(date);
                            const isCurrentMonth = date.getUTCMonth() === visibleMonth.getUTCMonth();
                            const isBoundary = value === startDate || value === endDate;
                            const isInRange = props.mode === "range" && Boolean(startDate && endDate && value > startDate && value < endDate);

                            return (
                                <div key={value} className={`flex justify-center py-0.5 ${isInRange ? "bg-blue/10" : ""}`}>
                                    <button
                                        type="button"
                                        disabled={!isCurrentMonth}
                                        onClick={() => selectDate(date)}
                                        aria-label={selectionFormatter.format(date)}
                                        aria-pressed={isBoundary}
                                        className={`grid size-8 place-items-center rounded-lg text-xs transition ${
                                            isBoundary
                                                ? "bg-blue font-bold text-light-blue shadow-md"
                                                : isCurrentMonth
                                                  ? "hover:bg-blue/15"
                                                  : "cursor-default text-blue/20"
                                        }`}
                                    >
                                        {date.getUTCDate()}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {props.mode === "range" && (
                        <p className="mt-3 border-t border-blue/10 pt-3 text-center text-xs text-blue/55">
                            {props.startDate && !props.endDate ? "Now choose an end date" : "Choose a start and end date"}
                        </p>
                    )}
                </div>,
                document.body,
            )}
        </div>
    );
}
