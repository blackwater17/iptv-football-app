This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## IPTV Football App
This app offers a seamless experience for discovering today's football events across numerous channels. With the ability to click on channels and play them directly through VLC Player, you can enjoy faster access to your favorite sport events.

## Features

**Football Events Overview:** 

Explore today's football events fetched from *sport-tv-guide.live* website.

**Stream Availability:**

Easily discover where to watch each game by clicking on events.

**Channel Search and Playback:**

Easily find and play your favorite channels using the search features. Then simply start the stream with a single click!

**Customization Options:**

You can customize the app by modifying popular channels, countries, and leagues lists directly in the code to suit your preferences and needs.

## Requirements

Ensure you have the following prerequisites installed:

- ****MongoDB****

- ****Node.js and npm****

- ****VLC Player****
  
- ****Legal IPTV Playlist****: Ensure you have a legitimate .m3u playlist file containing the IPTV channels required for the app to function properly.


## Installation

After installing the requirements:

- ****Clone this repository to your local machine.****

- ****Navigate to the project directory in your terminal.****

- ****Customize the path to your VLC Player installation by editing the following file:****
```bash
.env.local
```
By default, its set to:
```bash
  C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe
```
- ****Run the following command to install dependencies (only once):****
```bash
npm install
```
- ****Finally, run the following command to start the app (you should run this everytime you want to start the app):****
```bash
npm run dev
```
****After these steps, the app will be accessible for viewing at**** 
[http://localhost:3002](http://localhost:3002)

## Screenshots

<img src="https://i.ibb.co/z2nSgHV/Screenshot-4.jpg" alt="Screenshot" width="400">

## Disclaimer

Please ensure you have legal access to the IPTV channels provided in your .m3u playlist file. This app does not endorse or promote unauthorized access to any content.

## License

This project is licensed under the MIT License.
