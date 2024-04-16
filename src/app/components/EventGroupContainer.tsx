import React from 'react';
import { SportEvent } from '../../interfaces';

interface EventGroup {
  name: string;
  events: SportEvent[];
}

interface Props {
  sportEventGroups: EventGroup[];
  setChannelNames: React.Dispatch<React.SetStateAction<string[]>>;
  setWhereToWatchChannels: (eventUrl: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  subInputRef: React.RefObject<HTMLInputElement>;
}

const EventGroupContainer: React.FC<Props> = ({
  sportEventGroups,
  setChannelNames,
  setWhereToWatchChannels,
  inputRef,
  subInputRef
}) => {
  return (
    <div className="sport-event-groups-container">
      {sportEventGroups.map((eventGroup: EventGroup, index) => (
        eventGroup.events?.length > 0 &&
        <div className="event-group-container" key={index}>
          <h1 className="event-group-title">
            {eventGroup.name}
          </h1>
          <div className="sport-events-container">
            {eventGroup.events?.map((event: SportEvent, idx: number) => (
              <div className="event-container" key={idx} >
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
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventGroupContainer;
