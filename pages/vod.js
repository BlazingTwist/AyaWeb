import {useState} from "react";

export default function VideoPanel() {
    const [videoFile, setVideoFile] = useState(null);

    /**
     * @param {React.ChangeEvent<HTMLInputElement>}event
     */
    function handleFile(event) {
        if (!event.target || !event.target.files || event.target.files.length < 1) {
            console.log("no file selected!");
            setVideoFile(null);
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            console.log("load finished");
            setVideoFile(fileReader.result);
        }
        fileReader.readAsDataURL(event.target.files[0]);
        console.log("starting to load");
    }

    return <div className={styles.mainDiv}>
        {
            videoFile === null
                ? (<input type="file" onChange={handleFile}/>)
                : (
                    <video id="mainPlayer">
                        <source
                            src={videoFile}
                            type="video/mp4"/>
                    </video>
                )
        }
        <div style={{height: "20px", width: "100vw", background: "red"}}></div>
    </div>
}