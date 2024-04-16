import React from 'react';
import { useEffect } from 'react';

interface InputsContainerProps {
  inputRef: React.RefObject<HTMLInputElement>;
  subInputRef: React.RefObject<HTMLInputElement>;
  handleEnterKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetFilters: () => void;
  groupMatches: boolean;
  setGroupMatches: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputsContainer: React.FC<InputsContainerProps> = ({
  inputRef,
  subInputRef,
  handleEnterKeyPress,
  handleInputChange,
  resetFilters,
  groupMatches,
  setGroupMatches,
}) => {

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="inputs-container">
      <div className="inputs">
        <input
          ref={inputRef}
          type="text"
          className="mainquery"
          placeholder="Search channels"
          onKeyDown={handleEnterKeyPress}
        />
        <input
          ref={subInputRef}
          type="text"
          className="subquery px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Filter results"
          onChange={handleInputChange}
        />
      </div>
      <div className="filter-buttons">
        <button className="filter-btn reset-btn" onClick={resetFilters}>
          Reset
        </button>
        <button className="filter-btn toggle-view-btn" onClick={() => setGroupMatches(!groupMatches)}>
          {groupMatches ? "No group" : "Group by league"}
        </button>
      </div>
    </div>
  );
};

export default InputsContainer;
