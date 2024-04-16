import React from 'react';
import CountryFlag from 'react-country-flag';
import { runVLC } from '../../../utils/functions';

interface ChannelsListProps {
    channels: any[];
    subQueries: string[];
}

const ChannelsList: React.FC<ChannelsListProps> = ({ channels, subQueries }) => {

    const predictCountryIcon = function (input: string) {
        const countryCodeMatch = input.match(/^([A-Z]{2})(?=:?\s|$)/);
        if (countryCodeMatch) {
            const countryCode = countryCodeMatch[1];
            if (countryCode === "UK") {
                return "GB";
            }
            return countryCode.toUpperCase();
        }
        return null;
    };

    const getSubQueriedChannels = (channels: any[]) => {
        let subQueriedChannels = channels.filter((channel) => {
            let channelName = channel["tvgName"].toLowerCase();
            return subQueries.every((subQuery) => {
                return channelName.includes(subQuery);
            });
        });
        return subQueriedChannels;
    }

    return (
        <ul className="channels-container">
            {getSubQueriedChannels(channels).map((channel, idx) => (
                <button key={idx} onClick={() => {
                    runVLC(channel.url);
                }}>
                    <CountryFlag countryCode={predictCountryIcon(channel["tvgName"]) || ""} svg />
                    {channel["tvgName"]}
                </button>
            ))}
        </ul>
    );
};

export default ChannelsList;
