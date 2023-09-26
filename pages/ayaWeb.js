import FileExplorer from "../components/fileExplorer";
import Split from 'react-split'
import styles from './ayaWeb.module.css';
import Script from 'next/script';

export default function AyaWeb() {
    if (typeof window !== "undefined") {
        window.addEventListener("contextmenu", function (e) { e.preventDefault(); })
    }

    function isShortcutOverridden(e) {
        return false;
    }

    async function initCheerpJ() {
        await cheerpjInit({
            overrideShortcuts: isShortcutOverridden,
            preloadResources: ["/lt/runtime/rt.jar.sun.nio.ch.js"]
        });
        cheerpjCreateDisplay(-1, -1, document.getElementById("ayaGuiViewport"));
        cheerpjRunMain("ui.AyaWeb", "/app/aya/AyaWeb.jar", "/app/aya/")
            .then(code => {
                if (code !== 0) {
                    window.alert("Aya failed to start. But you can try reloading the page.");
                    console.log("exit code: " + code);
                } else {
                    console.log("Aya started successfully");
                }
            })
            .catch(err => {
                window.alert("Aya failed to start. But you can try reloading the page.");
                console.log("Aya start error: " + err);
            });
    }

    let ayaFile = "";

    function onPlayClicked() {
        let htmlConsole = document.getElementById("console");
        htmlConsole.textContent = "please wait...\n";
        // TODO actual file handling
        let fileName = "/str/main.aya";
        cheerpjAddStringFile(fileName, ayaFile);
        cjCall("ui.AyaWeb", "runScript", fileName)
            .then(result => {
                console.log("Result:")
                console.log(result);
            })
            .catch(err => {
                htmlConsole.append("Execution failed with error: " + err + "\n");
                console.log(err);
            })
    }

    function onStopClicked() {
        console.log("stopping script?");
        let htmlConsole = document.getElementById("console");
        cjCall("ui.AyaWeb", "abortExecution")
            .then(result => {
                console.log("Result:")
                console.log(result);
            })
            .catch(err => {
                htmlConsole.append("Failed to abort script due to error: " + err + "\n");
                console.log(err);
            })
    }

    function onFileContentChanged(content) {
        ayaFile = content;
    }

    let files = {
        name: "root",
        directories: [
            {
                name: "base",
                directories: [],
                files: [
                    {name: "__aya__.aya"},
                    {name: "block.aya"},
                    {name: "char.aya"}
                ]
            },
            {
                name: "examples",
                directories: [
                    {
                        name: "canvas",
                        directories: [],
                        files: [
                            {name: "attractor.aya"},
                            {name: "boids.aya"},
                            {name: "bouncing.aya"}
                        ]
                    },
                    {
                        name: "plot",
                        directories: [],
                        files: [
                            {name: "bernstein.aya"},
                            {name: "betting.aya"},
                            {name: "iris.aya"}
                        ]
                    },
                    {
                        name: "empty",
                        directories: [],
                        files: []
                    },
                    {
                        name: "onlyDirs",
                        directories: [
                            {
                                name: "empty",
                                directories: [],
                                files: []
                            },
                            {
                                name: "empty2",
                                directories: [],
                                files: []
                            }
                        ],
                        files: []
                    }
                ],
                files: [
                    {name: "100doors.aya"},
                    {name: "account.aya"},
                    {name: "asciitrain.aya"}
                ]
            },
            {
                name: "std",
                directories: [],
                files: [
                    {name: "asciiart.aya"},
                    {name: "bitset.aya"},
                    {name: "canvas.aya"}
                ]
            },
            {
                name: "test",
                directories: [],
                files: [
                    {name: "colon_ops.aya"},
                    {name: "core.aya"},
                    {name: "dot_ops.aya"}
                ]
            }
        ],
        files: [
            {name: "helloWorld.aya"},
            {name: "fooBar.aya"}
        ]
    };
    // TODO <div id="ayaGuiViewport"/>

    return <>
        <Script src="https://cjrtnc.leaningtech.com/2.3/cheerpOS.js" strategy="afterInteractive"/>
        <Script src="https://cjrtnc.leaningtech.com/2.3/loader.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("cheerpJ script loaded.");
                    (async () => {await initCheerpJ()})();
                }}/>
        <Split className="split-rows"
               direction="vertical" minSize={0} gutterSize={3} snapOffset={0}
               sizes={[80, 20]}
               style={{width: "100vw", height: "100vh"}}>
            <Split className="split-columns"
                   direction="horizontal" minSize={0} gutterSize={3} snapOffset={0}
                   sizes={[20, 80]}
                   style={{width: "100%", height: "100%"}}>
                {FileExplorer(files)}
                {CorePanel(onPlayClicked, onStopClicked, onFileContentChanged)}
            </Split>
            <Split className="split-columns"
                   direction="horizontal" minSize={0} gutterSize={3} snapOffset={0}
                   sizes={[20, 80]}
                   style={{width: "100%", height: "100%"}}>
                <div className={styles.ayaConsoleViewport}>
                    <pre id="console"/>
                </div>
                <div id="ayaGuiViewport"/>
            </Split>
        </Split>
    </>
}

/**
 * Contains the "Core" window (primary toolbar, tabber and editor)
 */
function CorePanel(onPlay, onStop, onFileContentChanged) {
    return <div className={styles.corePanel}>
        <div className={styles.coreToolbar}>
            <i className="fa-sm fa-play fa-green" onClick={onPlay}/>
            <i className="fa-sm fa-stop fa-red" onClick={onStop}/>
        </div>
        <textarea className={styles.fileEditorTextInput}
                  onInput={(event) => onFileContentChanged(event.currentTarget.value)}>
        </textarea>
    </div>
}