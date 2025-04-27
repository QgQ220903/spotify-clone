import React from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // cho kéo/thả, click



export const CalendarSchedule = ({events, dateClick, eventClick, calendarRef}) => {
    return (
    
            <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            // height="auto"
            // contentHeight="auto"
            // aspectRatio={1.5} // hoặc điều chỉnh theo nhu cầu
            // editable={true}
            // selectable={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short', // hoặc 'narrow' | 'long'
              hour12: true       // dùng định dạng 12 giờ (AM/PM)
            }}
        
    
            events ={events}
            dateClick={(info) => {
                // dateClick(info);
            }}
            eventClick={(info) => {
            
            //   eventClick(info);
            }}
          />
   

    )
}

export default CalendarSchedule