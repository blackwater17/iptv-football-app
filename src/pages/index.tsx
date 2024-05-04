import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import '../app/globals.css';
import popularCountryCodes from '../../utils/popularCountryCodes';
import { fetchHTML, getLeagueObjects, fetchFoundChannels, parseM3U } from '../../utils/functions';
import { SportEvent, MediaEntry } from '../interfaces';

import EventGroupContainer from '../app/components/EventGroupContainer';
import EventNoGroupContainer from '../app/components/EventNoGroupContainer';
import InputsContainer from '../app/components/InputsContainer';
import PopularChannels from '../app/components/PopularChannels';
import PopularFlags from '../app/components/PopularFlags';
import WatchFromList from '../app/components/WatchFromList';
import ChannelsList from '../app/components/ChannelsList';
import { time } from "console";


export default function Home() {

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [subQueries, setSubQueries] = useState<string[]>([]);
  const subInputRef = useRef<HTMLInputElement>(null);
  const [channels, setChannels] = useState([]);
  const [channelNames, setChannelNames] = useState<string[]>([]); // where to watch
  const [sportEventGroups, setSportEventGroups] = useState([]);
  const [allSportEvents, setAllSportEvents] = useState<SportEvent[]>([]);
  const [groupMatches, setGroupMatches] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [addedChannels, setAddedChannels] = useState(0);
  const [totalChannelsCount, setTotalChannelsCount] = useState(0);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null); // db

  const setWhereToWatchChannels = async (eventUrl: string) => {
    fetchHTML(eventUrl).then((htmlText: any) => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(htmlText, 'text/html');

      let channelNames: string[] = []

      const channelLinks = Array.from(doc.querySelectorAll<HTMLAnchorElement>("table.ichannels a"));
      channelNames = channelLinks
        .filter(a => a.href.includes("/channels/"))
        .map(e => e.textContent?.trim() || "N/A");
      const uniqueChannelsList = Array.from(new Set(channelNames));
      setChannelNames(uniqueChannelsList.sort((a, b) => a > b ? 1 : -1));
    });
  }

  const setWhereToWatchChannelsOffline = (visibleChannels: string[]) => {
    setChannelNames(visibleChannels)
  }

  const queryChannels = async () => {
    try {
      const response = await fetch(`/api/getChannels?text=${inputValue}`);
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      } else {
        console.error('Failed to fetch channels.');
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // main - onKeyDown event
  const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {

    const subqueryInput = document.querySelector<HTMLInputElement>(".subquery");
    if (subqueryInput) {
      subqueryInput.value = "";
    }
    setSubQueries([]);

    if (event.key === "Enter") {
      setInputValue((event.target as HTMLInputElement).value);
    }
  };

  // sub - onChange evnet
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let text = event.target.value;
    let arr = text.split(" ").map((t) => {
      return t.trim().toLowerCase();
    });
    setSubQueries(arr);
  };

  // get all sport events info, and group them by league
  const setSportEvents = async () => {

    // const leagueObjects = getLeagueObjects();
    const urlToFetch = "https://www.livesoccertv.com/schedules/"

    let htmlText: string = await fetchHTML(urlToFetch) || ""
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlText, 'text/html');

    const importantDOM = doc.querySelector(".schedules")

    const allEvents = [];

    const trs = importantDOM?.querySelectorAll("tr") || [];
    let currentLeagueName = "Unknown league"
    for (let i = 0; i < trs?.length; i++) {
      let tr = trs[i]
      if (tr && tr.className.includes("sortable_comp")) {
        currentLeagueName = tr.textContent?.trim() || "Unknown league"
        continue
      } else {
        let defaultLink = tr.querySelector("a")?.href || "";
        const url = new URL(defaultLink);
        let link = `https://www.livesoccertv.com${url.pathname}${url.search}${url.hash}`;
        let date = tr.querySelector(".timecell")?.textContent || "N/A"
        let dateElement = tr.querySelector(".timecell")?.textContent || ""
        let timeFloat = parseFloat(dateElement.replace(":",".") || "N/A")
        timeFloat += 7 // timezone difference
        date=timeFloat.toFixed(2).replace(".",":")
        let timeInteger = (60*(parseInt(dateElement.split(":")[0])+7)) + (parseInt(dateElement.split(":")[1])) 
        let eventType = "Football"
        let league = currentLeagueName
        let eventName = cleanMatchString(tr.querySelector("#match")?.textContent?.trim() || "N/A EventName")
        let day = null

        let visibleChannels = Array.from(tr.querySelector("#channels")?.querySelectorAll<HTMLAnchorElement>("a") || [])
          .filter(a => a.href.includes("channel"))
          .map(e => e.textContent?.trim() || '');

        let event = {
          link, date, timeFloat, timeInteger, eventType, league, eventName, day, visibleChannels
        }
        allEvents.push(event)
      }

    }

    // allEvents.forEach(d => console.log(d))
    setAllSportEvents(allEvents.sort((a,b) => a.timeFloat > b.timeFloat ? 1 : -1))

  }

  // getting events info
  useEffect(() => {
    setSportEvents()
  }, []);

  // time interval 
  useEffect(() => {
    const date = new Date();
    const newTotalMinutes = date.getHours() * 60 + date.getMinutes();
    setTotalMinutes(newTotalMinutes);
    const interval = setInterval(() => {
      const date = new Date();
      const newTotalMinutes = date.getHours() * 60 + date.getMinutes();
      setTotalMinutes(newTotalMinutes);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputValue === "") {
      setChannels([]);
    } else {
      queryChannels();
    }
  }, [inputValue]);

  useEffect(() => {
    fetchFoundChannels(channelNames);
  }, [channelNames]);


  const renderFromCountry = (countryCode: string) => {

    if (subInputRef.current) {
      if (countryCode === "GB") countryCode = "UK";
      subInputRef.current.value = countryCode + ": ";
      let arr = subInputRef.current.value.split(" ").map((word: string) => {
        return word.trim().toLowerCase();
      });
      setSubQueries(arr);
    }

  }

  function cleanMatchString(matchString: string): string {
    const scorePattern = /\d+\s*-\s*\d+/;
    return matchString.replace(scorePattern, 'vs').trim();
  }

  const resetFilters = () => {
    setSubQueries([]);
    setInputValue("");
    setChannelNames([]);
    if (inputRef.current && subInputRef.current) {
      inputRef.current.value = "";
      subInputRef.current.value = "";
    }
  }

  async function uploadMediaEntriesInBulks(mediaEntries: MediaEntry[], batchSize: number) {
    const totalEntries = mediaEntries.length;
    setTotalChannelsCount(totalEntries);
    let startIndex = 0;
    let totalChannelsAdded = 0;

    while (startIndex < totalEntries) {
      const endIndex = Math.min(startIndex + batchSize, totalEntries);
      const batch = mediaEntries.slice(startIndex, endIndex);

      try {
        const response = await fetch('/api/createDatabase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mediaEntries: batch }), // Send entire batch
        });

        if (response.ok) {
          totalChannelsAdded += batch.length;
          // console.log(`${totalChannelsAdded}/${totalEntries} channels are added`);
          setAddedChannels(totalChannelsAdded);
        } else {
          console.error('Failed to create database:', response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
      // await new Promise(resolve => setTimeout(resolve, 5000));
      startIndex = endIndex;
    }

    window.location.reload();

  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string;
        const mediaEntries = parseM3U(content);
        const batchSize = 500;
        setScanInProgress(true);
        uploadMediaEntriesInBulks(mediaEntries, batchSize);
      }
    };

    reader.readAsText(file);
  }

  const checkDatabaseValidity = async () => {
    try {
      const response = await axios.post('/api/isDatabaseValid', {
        databaseName: process.env.DATABASE_NAME || '',
        collectionName: 'channels',
      });
      setIsValid(response.data.isValid);
    } catch (error) {
      console.error('Error checking database validity:', error);
    }
  };

  useEffect(() => {
    checkDatabaseValidity();
  }, [])

  return (
    <div className="content-container">

      <div className="text-white">
        {!scanInProgress && isValid !== null && !isValid && (
          <div className="w-full max-w-md mx-auto p-6 text-center">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="hidden"
              accept=".m3u"
              aria-label="Upload playlist file"
            />
            <label
              htmlFor="file-input"
              className="block cursor-pointer bg-gray-100 hover:bg-gray-200 p-6 rounded-lg"
            >
              <span className="text-gray-500 text-lg font-semibold">To view your channels, click and load the .m3u playlist file (one-time only)</span>
            </label>
          </div>
        )}
      </div>

      {scanInProgress &&
        <div className="fixed top-0 right-0 m-4 bg-gray-800 px-4 py-2 rounded-md">
          <p className="text-white text-center">
            {addedChannels}/{totalChannelsCount} channels added
          </p>
        </div>
      }

      {/* {groupMatches &&
        <EventGroupContainer
          sportEventGroups={sportEventGroups}
          setChannelNames={setChannelNames}
          setWhereToWatchChannels={setWhereToWatchChannels}
          inputRef={inputRef}
          subInputRef={subInputRef}
        />} */}

      {!groupMatches &&
        <EventNoGroupContainer
          events={allSportEvents}
          totalMinutes={totalMinutes}
          setChannelNames={setChannelNames}
          setWhereToWatchChannels={setWhereToWatchChannels}
          setWhereToWatchChannelsOffline={setWhereToWatchChannelsOffline}
          inputRef={inputRef}
          subInputRef={subInputRef}
        />
      }

      <InputsContainer
        inputRef={inputRef}
        subInputRef={subInputRef}
        handleEnterKeyPress={handleEnterKeyPress}
        handleInputChange={handleInputChange}
        resetFilters={resetFilters}
        groupMatches={groupMatches}
        setGroupMatches={setGroupMatches}
      />

      <PopularChannels
        setInputValue={setInputValue}
        inputRef={inputRef}
        subInputRef={subInputRef}
        setSubQueries={setSubQueries}
      />

      <PopularFlags
        popularCountryCodes={popularCountryCodes}
        renderFromCountry={renderFromCountry}
      />

      <WatchFromList
        channelNames={channelNames}
        setInputValue={setInputValue}
        setSubQueries={setSubQueries}
        subInputRef={subInputRef}
      />

      <ChannelsList
        channels={channels}
        subQueries={subQueries}
      />

    </div>
  );
}
