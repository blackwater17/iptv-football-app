import React from 'react';

// update as you wish
const popularChannels: string[] = [
    "ESPN", "Fox Sports", "CBS Sports", "Sky Sports", "BT Sport", "NBC Sports", "DAZN", "TNT Sports", "GOL TV", "Eleven Sports", "Sport TV", "SuperSport"
]

interface PopularChannelsProps {
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
    setSubQueries: React.Dispatch<React.SetStateAction<string[]>>;
    inputRef: React.RefObject<HTMLInputElement>;
    subInputRef: React.RefObject<HTMLInputElement>;
}

const PopularChannels: React.FC<PopularChannelsProps> = ({
    setInputValue,
    setSubQueries,
    inputRef,
    subInputRef,
}) => {
    return (
        <div className="popular-channels">
            {popularChannels.map((channelName, index) => (
                <div className="popular-channel" key={index} onClick={() => {
                    setInputValue(channelName);
                    setSubQueries([]);
                    if (inputRef.current && subInputRef.current) {
                        inputRef.current.value = channelName;
                        subInputRef.current.value = "";
                    }
                }}>{channelName}</div>
            ))}
        </div>
    );
};

export default PopularChannels;
