<script>
    import PaperCanvas from "$lib/components/PaperCanvas.svelte";
    import {clearParticles, drawParticles} from "$lib/utils/genuary.2024.01.js";
    import {drawGenerativeColors, resetColors} from "$lib/utils/genuary.2024.02.js";
    import {onMount} from "svelte";
    import {clearDroste, drawDroste} from "$lib/utils/genuary.2024.03.js";
    import {drawPixels, clearPixels} from "$lib/utils/genuary.2024.04.js";

    let key = 0;
    let ping = 0;
    let debug = false;
    let sketches = [
        {name: "00. Select a prompt...", sketch: () => {}, reset: () => {}},
        {name: "01. Particles. Lots of them.", sketch: drawParticles, reset: clearParticles, animation: true},
        {name: "02. No palettes.", sketch: drawGenerativeColors, reset: resetColors, animation: false},
        {name: "03. Droste effect.", sketch: drawDroste, reset: clearDroste, animation: false},
        {name: "04. Pixels.", sketch: drawPixels, reset: clearPixels, animation: true}
    ];
    let selectedSketchIndex = 0;
    let selectedSketch = sketches[selectedSketchIndex];

    function handleSelectSketch(event) {
        selectedSketchIndex = event.target.value;
        selectedSketch = sketches[selectedSketchIndex];
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

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const sketch = params.get("prompt");
        if (sketch) {
            selectedSketchIndex = sketch;
            selectedSketch = sketches[selectedSketchIndex];
        }
    });
</script>

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
            <svg class="dice-svg" fill="#000000" height="800px" width="800px" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 viewBox="0 0 512 512" xml:space="preserve">
                <path d="M512,192V21.3l-64.9,64.9C400.3,33.4,332.2,0,256,0C114.6,0,0,114.6,0,256s114.6,256,256,256c70.7,0,134.7-28.6,181-75
                    l-45.3-45.2C357,426.5,309,448,256,448c-106,0-192-85.9-192-192c0-106.1,86-192,192-192c58.5,0,110.4,26.5,145.5,67.8L341.3,192H512
                    z"/>
            </svg>
        </button>
    </div>

    <PaperCanvas key={key}
                 sketch={selectedSketch.sketch}
                 reset={selectedSketch.reset}
                 animate={selectedSketch.animation}
                 debug={debug}
                 ping={ping}
                 />

    <div class="footer">
        <div class="debug-container">
            <label for="debug">draw debug lines</label>
            <input type="checkbox" id="debug" name="debug" on:change={handleDebug} bind:checked={debug}
                   data-umami-event="check-debug" data-umami-event-checked={debug} data-umami-event-sketch={sketches[selectedSketchIndex].name}/>
        </div>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    h2 {
        font-size: 1rem;
        margin-top: -.5rem;
        margin-bottom: 1rem;
    }

    a {
        color: rgba(0, 0, 0, 1);
        border-style: dashed;
        border-width: 0 0 1px 0;
        text-decoration: none;
    }

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
        font-size: 1rem;
    }

    select {
        width: 100%;
        background-color: rgba(255, 255, 255, 1);
        font-family: "Courier New", Courier, monospace;
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
</style>