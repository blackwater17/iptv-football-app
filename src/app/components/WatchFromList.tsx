import React from 'react';

interface WatchFromListProps {
  channelNames: string[];
  setInputValue: (value: string) => void;
  setSubQueries: (subQueries: string[]) => void;
  subInputRef: React.RefObject<HTMLInputElement>;
}

const WatchFromList: React.FC<WatchFromListProps> = ({ channelNames, setInputValue, setSubQueries, subInputRef }) => {
  return (
    channelNames.length > 0 &&
    <ul className="watch-from-container">
      {channelNames.map((channelName, idx) => (
        <button key={idx} onClick={() => {
          setInputValue(channelName);

          if (subInputRef.current) {
            subInputRef.current.value = "";
          }
          setSubQueries([]);
        }}>
          {channelName}
        </button>
      ))}
    </ul>
  );
};

export default WatchFromList;
