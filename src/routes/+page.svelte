<script>
    import PaperCanvas from "$lib/components/PaperCanvas.svelte";
    import {clearParticles, drawParticles} from "$lib/utils/genuary.2024.01.js";
    import {drawGenerativeColors, resetColors} from "$lib/utils/genuary.2024.02.js";
    import {onMount} from "svelte";
    import {clearDroste, drawDroste} from "$lib/utils/genuary.2024.03.js";
    import {drawPixels, clearPixels} from "$lib/utils/genuary.2024.04.js";
    import {marked} from "marked";
    import {clearVera, drawVera} from "$lib/utils/genuary.2024.05.js";
    import {clearScreenSaver, drawScreenSaver} from "$lib/utils/genuary.2024.06.js";
    import {clearSpinner, drawSpinner} from "$lib/utils/genuary.2024.07.js";
    import {clearChaos, drawChaos} from "$lib/utils/genuary.2024.08.js";
    import {clearAscii, drawAscii} from "$lib/utils/genuary.2024.09.js";

    let key = 0;
    let ping = 0;
    let debug = false;
    let sketches = [
        {name: "00. Select a prompt...", sketch: () => {}, reset: () => {}, animation: false, md: "/md/00.md"},
        {name: "01. Particles, lots of them", sketch: drawParticles, reset: clearParticles, animation: true, md: "/md/01.md"},
        {name: "02. No palettes", sketch: drawGenerativeColors, reset: resetColors, animation: false, md: "/md/02.md"},
        {name: "03. Droste effect", sketch: drawDroste, reset: clearDroste, animation: false, md: "/md/03.md"},
        {name: "04. Pixels", sketch: drawPixels, reset: clearPixels, animation: true, md: "/md/04.md"},
        {name: "05. Vera Molnár (1924-2023)", sketch: drawVera, reset: clearVera, animation: false, md: "/md/05.md"},
        {name: "06. Screensaver", sketch: drawScreenSaver, reset: clearScreenSaver, animation: true, md: "/md/06.md"},
        {name: "07. Progress bar", sketch: drawSpinner, reset: clearSpinner, animation: true, md: "/md/07.md"},
        {name: "08. Chaotic system", sketch: drawChaos, reset: clearChaos, animation: true, md: "/md/08.md"},
        {name: "09. ASCII", sketch: drawAscii, reset: clearAscii, animation: true, md: "/md/09.md"},
    ];
    let selectedSketchIndex = 0;
    let selectedSketch = sketches[selectedSketchIndex];

    let markdownContent = '';
    let htmlContent = '';
    let footerContent = '';

    let paperCanvas;

    let isLocalHost = false;
    let recording = false;

    async function handleSelectSketch(event) {
        selectedSketchIndex = event.target.value;
        selectedSketch = sketches[selectedSketchIndex];
        handleMarkdown();
        key++;
    }

    function handleDebug() {
        if (selectedSketch.reset) {
            selectedSketch.reset();
        }
        key++;
    }

    function handleDice() {
        if (selectedSketch.reset) {
            selectedSketch.reset();
            ping++;
        }
        key++;
    }

    function handleDownload() {
        if (paperCanvas && paperCanvas.downloadFrame) {
            paperCanvas.downloadFrame();
        }
    }

    async function handleMarkdown() {
        if (selectedSketch && selectedSketch.md) {
            loadMarkdown(selectedSketch.md);
        }
    }

    async function loadFooter() {
        const response = await fetch("/md/footer.md");
        footerContent = marked(await response.text());
    }

    async function loadMarkdown(url) {
        const response = await fetch(url);
        markdownContent = await response.text();
        htmlContent = marked(markdownContent);
    }

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const sketch = params.get("prompt");
        if (sketch) {
            selectedSketchIndex = sketch;
            selectedSketch = sketches[selectedSketchIndex];
            handleMarkdown();
        }
        else {
            loadMarkdown("/md/00.md");
        }
        loadFooter();
        isLocalHost = window.location.hostname === "localhost";
    });

</script>


<!--****************************************************
 *          content
****************************************************-->

<main>

    <h1><a href="https://genuary.art" target="_blank" data-umami-event="follow-link" data-umami-event-link="genuary.2024">Genuary 2024</a></h1>
    <h2>entries by <a href="https://d17e.dev" target="_self" data-umami-event="follow-link" data-umami-event-link="d17e.dev">d17e.dev</a></h2>


    <div class="header">
        <select on:change={handleSelectSketch} id="sketch-selection" aria-label="select prompt from list" data-umami-event="sketch-select" data-umami-event-sketch={sketches[selectedSketchIndex].name}>
            {#each sketches as sketch, index}
                <option value={index}>
                    {sketch.name}
                </option>
            {/each}
        </select>
        <div style="width: 1rem;"></div>
        <button class="dice-button" on:click={handleDice} title="reset the sketch" data-umami-event="sketch-refresh" data-umami-event-sketch={sketches[selectedSketchIndex].name}>
            <svg class="dice-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 3V8M21 8H16M21 8L18 5.29168C16.4077 3.86656 14.3051 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.2832 21 19.8675 18.008 20.777 14" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <button class="dice-button second" on:click={handleDownload} title="download frame" data-umami-event="sketch-download-frame" data-umami-event-sketch={sketches[selectedSketchIndex].name}>
            <svg class="dice-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        {#if isLocalHost}
            <button class="dice-button second" on:click={() => recording = !recording} title="record animation" data-umami-event="sketch-record" data-umami-event-sketch={sketches[selectedSketchIndex].name}>
                <svg class="dice-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {#if recording}
                        <path d="M3 3H21V21H3V3Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#FF0000"/>
                    {:else}
                        <path d="M3 3H21V21H3V3Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 5H19V19H5V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    {/if}
                </svg>
            </button>
        {/if}
    </div>

    <PaperCanvas bind:this={paperCanvas} key={key}
                 name={selectedSketch.name}
                 sketch={selectedSketch.sketch}
                 reset={selectedSketch.reset}
                 animate={selectedSketch.animation}
                 debug={debug}
                 ping={ping}
                 record={recording}
                 />

    <div class="footer">
        <div class="debug-container">
            <label for="debug">draw debug lines</label>
            <input type="checkbox" id="debug" name="debug" on:change={handleDebug} bind:checked={debug}
                   data-umami-event="check-debug" data-umami-event-checked={debug} data-umami-event-sketch={sketches[selectedSketchIndex].name}/>
        </div>
    </div>

    {#if selectedSketch.md}
        <div class="markdown-container">
            <div class="markdown-content">
                {@html htmlContent}
            </div>
        </div>
    {/if}
    <div class="markdown-container">
        <div class="markdown-content page-footer">
            {@html footerContent}
        </div>
    </div>
</main>

<!--****************************************************
 *          styles
*****************************************************-->
<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin: 1rem .5rem 1rem .5rem;
        font-size: 1rem;
    }

    select {
        width: 100%;
        background-color: rgba(255, 255, 255, 1);
        font-family: 'Poppins', sans-serif;
        padding: 0.8rem;
        font-size: 1rem;
        border-radius: .5rem;
        border-color: rgba(0, 0, 0, 1);
        border-width: 1px;
        border-style: dashed;
    }

    .dice-button {
        background-color: transparent;
        cursor: pointer;
        padding: 10px;
        border: 1px dashed black;
        border-radius: .5rem;
    }

    .dice-button:hover {
        transform: scale(1.1);
        transition: transform 0.1s ease-in-out;
    }

    .dice-button:active {
        transform: translate(1px, 1px);
        transition: transform 0.1s ease-in-out;
    }

    .dice-button.second {
        margin-left: .5rem;
    }

    .dice-svg {
        width: 20px;
        height: 20px;
    }

    .footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
        font-size: 1rem;
    }

    .markdown-container {
        width: 90vw;
        max-width: 40rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .page-footer {
        margin-top: 1rem;
        margin-bottom: 1rem;
        text-align: center;
        line-height: 10pt;
    }
</style>