import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

import { motion } from "framer-motion";

import { AppEvent } from "./EventosPage";
import "./EventsCalendarView.css";

type Props = {
  eventos: AppEvent[];
  isAdmin: boolean;
  onOpenDetails: (e: AppEvent) => void;
  onAdd: () => void;
  onEdit: (e: AppEvent) => void;
  onDelete: (e: AppEvent) => void;
};

type DayKey = string;
const toDayKey = (d: Dayjs) => d.format("YYYY-MM-DD");
const toEventDayKey = (iso: string) => dayjs(iso).format("YYYY-MM-DD");

function getStatusColor(dateISO: string) {
  const d = dayjs(dateISO);
  const hoje = dayjs();
  const diff = d.diff(hoje, "day");

  if (d.isSame(hoje, "day")) return "#ef4444";
  if (diff === 1) return "#f59e0b";
  if (diff >= 2 && diff <= 7) return "#3b82f6";
  if (diff >= 8 && diff <= 30) return "#6366f1";
  if (diff > 30) return "#10b981";
  return "#94a3b8";
}

export default function EventsCalendarView({
  eventos,
  isAdmin,
  onOpenDetails,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogEvents, setDialogEvents] = useState<AppEvent[]>([]);

  const eventsByDay = useMemo(() => {
    const map = new Map<DayKey, AppEvent[]>();

    for (const e of eventos) {
      const k = toEventDayKey(e.date);
      const list = map.get(k) || [];
      list.push(e);
      map.set(k, list);
    }

    for (const [k, list] of map.entries()) {
      list.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
      map.set(k, list);
    }

    return map;
  }, [eventos]);

  const calendarDays = useMemo(() => {
    const firstDay = currentMonth.startOf("month");
    const lastDay = currentMonth.endOf("month");

    const startDay = firstDay.startOf("week");

    const endDay = lastDay.endOf("week");

    const days: Dayjs[] = [];
    let current = startDay;

    while (current.isBefore(endDay) || current.isSame(endDay, "day")) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const result: Dayjs[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const selectedLabel = selectedDate.format("dddd, DD [de] MMMM [de] YYYY");
  const monthLabel = currentMonth.format("MMMM YYYY");

  const openDayEventsDialog = (d: Dayjs) => {
    const list = eventsByDay.get(toDayKey(d)) || [];
    if (!list.length) return;

    setDialogEvents(list);
    setDialogOpen(true);
  };

  const handleDayClick = (d: Dayjs) => {
    setSelectedDate(d);
    if (eventsByDay.has(toDayKey(d))) {
      openDayEventsDialog(d);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const weekDayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Paper elevation={0} className="events-paper-root">
          <Box className="events-header-box">
            {isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                  <CalendarTodayIcon className="events-header-icon" sx={{ fontSize: '1.2rem !important' }} />
                  <Typography className="events-date-label-text" sx={{ fontSize: '0.85rem !important', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedLabel}
                  </Typography>
                </Box>
                {isAdmin && (
                  <Button
                    onClick={onAdd}
                    startIcon={<AddIcon sx={{ width: 16, height: 16 }} />}
                    variant="contained"
                    size="small"
                    sx={{
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--events-green) 0%, #00bb44 100%)',
                    }}
                  >
                    Novo
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Box className="events-header-left">
                  <CalendarTodayIcon className="events-header-icon" />
                  <Box>
                    <Typography className="events-header-title">Calendário mensal</Typography>
                    <Typography className="events-header-subtitle">
                      Clique em um dia marcado para ver os eventos
                    </Typography>
                  </Box>
                </Box>

                <Box className="events-header-right">
                  <Box className="events-date-label-box">
                    <Typography className="events-date-label-text">{selectedLabel}</Typography>
                  </Box>

                  {isAdmin && (
                    <Button onClick={onAdd} startIcon={<AddIcon />} variant="contained" className="events-add-button">
                      Novo
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Box>

          <Divider />

          <Box className="events-calendar-box">
            <Box className="custom-calendar-header">
              <IconButton onClick={handlePrevMonth} className="month-nav-button">
                <ChevronLeftIcon />
              </IconButton>
              <Typography className="month-label">{monthLabel}</Typography>
              <IconButton onClick={handleNextMonth} className="month-nav-button">
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Box className="weekday-labels">
              {weekDayLabels.map((label, idx) => (
                <Box key={idx} className={`weekday-label ${idx === 0 ? "sunday" : ""}`}>
                  {label}
                </Box>
              ))}
            </Box>

            <Box className="calendar-grid">
              {weeks.map((week, weekIdx) => (
                <motion.div
                  key={weekIdx}
                  className="calendar-week"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: weekIdx * 0.05, duration: 0.3 }}
                >
                  {week.map((day, dayIdx) => {
                    const dayKey = toDayKey(day);
                    const list = eventsByDay.get(dayKey);
                    const hasEvents = !!list?.length;
                    const accentColor = hasEvents ? getStatusColor(list![0].date) : undefined;
                    const isCurrentMonth = day.month() === currentMonth.month();
                    const isSelected = day.isSame(selectedDate, "day");
                    const isToday = day.isSame(dayjs(), "day");

                    return (
                      <motion.div
                        key={dayKey}
                        className={`calendar-day ${!isCurrentMonth ? "outside-month" : ""} ${isSelected ? "selected" : ""
                          } ${isToday ? "today" : ""} ${hasEvents ? "has-events" : ""}`}
                        onClick={() => handleDayClick(day)}
                        style={
                          {
                            "--accent-color": accentColor || "#94a3b8",
                          } as React.CSSProperties
                        }
                        whileHover={{ scale: isCurrentMonth ? 1.05 : 1 }}
                        whileTap={{ scale: isCurrentMonth ? 0.95 : 1 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: weekIdx * 0.05 + dayIdx * 0.02, duration: 0.2 }}
                      >
                        <Box className="day-number">{day.date()}</Box>

                        {hasEvents && isCurrentMonth && (
                          <>
                            <motion.div
                              className="day-indicator"
                              style={{ backgroundColor: accentColor }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 + weekIdx * 0.05, type: "spring" }}
                            />
                            {(list?.length || 0) > 1 && (
                              <motion.div
                                className="day-badge"
                                style={{ backgroundColor: accentColor }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.4 + weekIdx * 0.05, type: "spring" }}
                              >
                                {list!.length > 9 ? "9+" : list!.length}
                              </motion.div>
                            )}
                          </>
                        )}

                        {isToday && isCurrentMonth && (
                          <motion.div
                            className="today-pulse"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ))}
            </Box>

            {eventsByDay.has(toDayKey(selectedDate)) && (
              <Box className="events-action-button-small">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => openDayEventsDialog(selectedDate)}
                  className="events-action-button"
                >
                  Ver eventos do dia
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: "events-dialog-paper" }}
      >
        <DialogTitle className="events-dialog-title">
          <EventIcon className="events-dialog-icon" />
          <Typography className="events-dialog-title-text">Eventos em {selectedLabel}</Typography>
        </DialogTitle>

        <DialogContent className="events-dialog-content">
          <Stack spacing={1.5}>
            {dialogEvents.map((ev) => {
              const accent = getStatusColor(ev.date);
              const hora = dayjs(ev.date).format("HH:mm");

              return (
                <Paper
                  key={ev.id}
                  elevation={0}
                  className="events-dialog-event-item"
                  style={{
                    borderColor: accent,
                    background: `linear-gradient(135deg, ${accent}10 0%, rgba(255,255,255,0.92) 70%)`,
                  }}
                >
                  <Box className="events-event-item-container">
                    <Box className="events-event-item-content">
                      <Typography className="events-event-item-title">{ev.title}</Typography>

                      <Stack spacing={0.7} className="events-event-details-stack">
                        <Box className="events-event-detail-item">
                          <CalendarTodayIcon className="events-event-detail-icon" />
                          <Typography variant="body2" className="events-event-detail-text">
                            {hora !== "00:00" ? hora : "Horário não informado"}
                          </Typography>
                        </Box>

                        <Box className="events-event-detail-item">
                          <PlaceIcon className="events-event-detail-icon" />
                          <Typography variant="body2" className="events-event-detail-text">
                            {ev.location || "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box className="events-event-actions-container">
                      {isAdmin && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEdit(ev)} className="events-icon-button-edit">
                              <EditIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => onDelete(ev)} className="events-icon-button-delete">
                              <DeleteIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onOpenDetails(ev)}
                        className="events-details-button"
                      >
                        Detalhes
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions className="events-dialog-actions">
          <Button onClick={() => setDialogOpen(false)} variant="outlined" className="events-dialog-close-button">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
