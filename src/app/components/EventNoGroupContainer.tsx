import React from 'react';
import { SportEvent } from '../../interfaces';

interface EventNoGroupContainerProps {
  events: SportEvent[];
  totalMinutes: number;
  setChannelNames: (channelNames: string[]) => void;
  setWhereToWatchChannels: (eventUrl: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  subInputRef: React.RefObject<HTMLInputElement>;
}

const EventNoGroupContainer: React.FC<EventNoGroupContainerProps> = ({ events, totalMinutes, setChannelNames, setWhereToWatchChannels, inputRef, subInputRef }) => {
  return (
    <div className="sport-event-groups-container">
      <div className="event-group-container">
        {events.length > 0 && <h1 className="event-group-title">ALL EVENTS</h1>}
        <div className="sport-events-container">
          {events.map((event, idx) => (
            <div className={"event-container " + ((totalMinutes - event.timeInteger) < 105 && (totalMinutes - event.timeInteger > 0) ? 'live' : '')} key={idx} >
              <p className="date">{event.date}</p>
              <div onClick={() => {
                setChannelNames([]);
                setWhereToWatchChannels(event.link);
                if (inputRef.current && subInputRef.current) {
                  inputRef.current.value = "";
                  subInputRef.current.value = "";
                }
              }}>
                {event.eventName}
                <span className="league">({event.league})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventNoGroupContainer;
