import { Meetup } from "../types/models";

export const parseDate = (dateInput: string | number) => {
  // If the input is a number or numeric string, treat as UNIX timestamp
  if (typeof dateInput === "number" || /^\d+$/.test(dateInput)) {
    // Convert seconds to milliseconds if needed
    const timestamp = Number(dateInput);
    return new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
  }

  // Parse date in format "DD/MM/YYYY hh:mm pm/am"
  const dateTimeMatch = dateInput.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(am|pm)/i
  );
  if (!dateTimeMatch) {
    // Fallback to old format "YYYY-MM-DD"
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day, 9, 0, 0);
  }

  const [, day, month, year, hour, minute, period] = dateTimeMatch;
  let hour24 = parseInt(hour, 10);

  // Convert to 24-hour format
  if (period.toLowerCase() === "pm" && hour24 !== 12) {
    hour24 += 12;
  } else if (period.toLowerCase() === "am" && hour24 === 12) {
    hour24 = 0;
  }

  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    hour24,
    parseInt(minute, 10),
    0
  );
};


export const formatDisplayDate = (unixTimestamp: number): string => {
  if (!unixTimestamp) return '';

  // Handle seconds-based timestamps by converting to ms
  const date = new Date(
    unixTimestamp < 1e12 ? unixTimestamp * 1000 : unixTimestamp
  );

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const generateGoogleCalendarLink = (meetup: Meetup) => {
  const startDate = parseDate(meetup.date);

  // Parse duration to get end time
  const durationMatch = meetup.duration.match(/(\d+)/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const endDate = new Date(
    startDate.getTime() + durationHours * 60 * 60 * 1000
  );

  // Format dates for Google Calendar
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Create Google Calendar URL
  const eventDetails = {
    text: meetup.title,
    dates: `${startDateStr}/${endDateStr}`,
    details: meetup.description,
    location: meetup.venue.address,
    ctz: "America/Los_Angeles", // Default timezone, you can make this dynamic
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventDetails.text
  )}&dates=${eventDetails.dates}&details=${encodeURIComponent(
    eventDetails.details
  )}&location=${encodeURIComponent(eventDetails.location)}&ctz=${
    eventDetails.ctz
  }`;

  return googleCalendarUrl;
};

export const generateOutlookCalendarLink = (meetup: Meetup) => {
  const startDate = parseDate(meetup.date);

  // Parse duration to get end time
  const durationMatch = meetup.duration.match(/(\d+)/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const endDate = new Date(
    startDate.getTime() + durationHours * 60 * 60 * 1000
  );

  // Format dates for Outlook
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Create Outlook Calendar URL
  const eventDetails = {
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: meetup.title,
    startdt: startDateStr,
    enddt: endDateStr,
    body: meetup.description,
    location: meetup.venue.address,
  };

  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/${
    eventDetails.path
  }?${new URLSearchParams(eventDetails).toString()}`;

  return outlookCalendarUrl;
};

export const generateYahooCalendarLink = (meetup: Meetup) => {
  const startDate = parseDate(meetup.date);

  // Parse duration to get end time
  const durationMatch = meetup.duration.match(/(\d+)/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const endDate = new Date(
    startDate.getTime() + durationHours * 60 * 60 * 1000
  );

  // Format dates for Yahoo Calendar
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Create Yahoo Calendar URL
  const eventDetails = {
    v: "60",
    title: meetup.title,
    st: startDateStr,
    et: endDateStr,
    desc: meetup.description,
    in_loc: meetup.venue.address,
  };

  const yahooCalendarUrl = `https://calendar.yahoo.com/?${new URLSearchParams(
    eventDetails
  ).toString()}`;

  return yahooCalendarUrl;
};

export const generateICSFile = (meetup: Meetup) => {
  const startDate = parseDate(meetup.date);

  // Parse duration to get end time
  const durationMatch = meetup.duration.match(/(\d+)/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 2;
  const endDate = new Date(
    startDate.getTime() + durationHours * 60 * 60 * 1000
  );

  // Format dates for ICS
  const formatICSDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const startDateStr = formatICSDate(startDate);
  const endDateStr = formatICSDate(endDate);

  // Create ICS content
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Car Meetups//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@carmeetups.com`,
    `DTSTART:${startDateStr}`,
    `DTEND:${endDateStr}`,
    `SUMMARY:${meetup.title}`,
    `DESCRIPTION:${meetup.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${meetup.venue.address}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
};

export const downloadICSFile = (meetup: Meetup) => {
  const icsContent = generateICSFile(meetup);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${meetup.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatDateTimeLocal = (timestamp: number) => {
  // if timestamp is in seconds, multiply by 1000
  const date = new Date(timestamp * 1000);

  // toISOString() returns like 2025-08-17T17:35:42.000Z
  // we only need YYYY-MM-DDTHH:mm (no seconds, no Z)
  return date.toISOString().slice(0, 16);
}