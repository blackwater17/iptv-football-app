import React from 'react';
import CountryFlag from 'react-country-flag';

interface PopularFlagsProps {
  popularCountryCodes: string[];
  renderFromCountry: (countryCode: string) => void;
}

const PopularFlags: React.FC<PopularFlagsProps> = ({ popularCountryCodes, renderFromCountry }) => {
  return (
    <div className="popular-flags">
      {popularCountryCodes.map((countryCode: string, index: number) => (
        <div key={index} className="flag-container" onClick={() => renderFromCountry(countryCode)}>
          <CountryFlag countryCode={countryCode} svg />
        </div>
      ))}
    </div>
  );
};

export default PopularFlags;
