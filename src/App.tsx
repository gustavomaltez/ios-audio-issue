import { useEffect, useRef, useState } from "react";

export function App(): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false);

    if (!isInitialized) return <button onClick={() => setIsInitialized(true)}>Click To Start</button>;

    return <Recorder />;
}

const audio = new Audio("https://samplelib.com/lib/preview/mp3/sample-15s.mp3");

function Recorder(): JSX.Element {
    const { isRecording, startRecording, stopRecording } = useMicrophoneRecorder();

    useEffect(() => {
        audio.loop = true;
        audio.play();
    }, []);


    return (
        <div>
            <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Stop" : "Start"} recording
            </button>
            <div id="logs"></div>
        </div>
    );
}

function useMicrophoneRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const recorder = useRef<MediaRecorder>();

    async function setupRecorder() {
        const stream = await getMediaStream();
        recorder.current = new MediaRecorder(stream, { mimeType: "audio/webm", audioBitsPerSecond: 16000, });
        (window as any).recorder = recorder;
        recorder.current.ondataavailable = (e) => {
            console.log(e.data);
            const logs = document.getElementById("logs") as HTMLDivElement;
            logs.innerHTML += `<p>Finished Recording: Blob size ${e.data.size}</p>`;
        };
        recorder.current.onstart = () => setIsRecording(true);
        recorder.current.onstop = () => setIsRecording(false);
    }

    return {
        startRecording: async () => {
            if (recorder?.current?.state === "recording") recorder.current?.stop();
            if (!recorder.current) await setupRecorder();
            recorder.current?.start();
        },
        stopRecording: () => {
            recorder?.current?.stop();
        },
        isRecording,
    };
}



async function getMediaStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 }, video: false });
    return stream;
}