<script>
    import PaperCanvas from "$lib/components/PaperCanvas.svelte";
    import {clearParticles, drawParticles} from "$lib/utils/genuary.2024.01.js";
    import {drawGenerativeColors, resetColors} from "$lib/utils/genuary.2024.02.js";

    let key = 0;
    let debug = false;
    let sketches = [
        {name: "00. No sketch selected.", sketch: () => {}, reset: () => {}},
        {name: "01. Particles. Lots of them.", sketch: drawParticles, reset: clearParticles, animation: true},
        {name: "02. No palettes.", sketch: drawGenerativeColors, reset: resetColors, animation: false}
    ];

    let selectedSketch = sketches[0];

    function handleSelectSketch(event) {
        selectedSketch = sketches[event.target.value];
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
        }
        key++;
    }

</script>

<main>

    <h1><a href="https://genuary.art" target="_blank">Genuary 2024</a></h1>
    <h2>entries by <a href="https://d17e.dev" target="_self">d17e.dev</a></h2>
    <div class="header">

        <label for="sketch-selection" style="width: 14rem; margin-right: .5rem;">select sketch:</label>
        <select on:change={handleSelectSketch} id="sketch-selection">
            {#each sketches as sketch, index}
                <option value={index}>
                    {sketch.name}
                </option>
            {/each}
        </select>

        <div style="width: 3rem;"></div>
        <button class="dice-button" on:click={handleDice} title="reset the sketch">
            <svg class="dice-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8H8.01M16 8H16.01M12 12H12.01M16 16H16.01M8 16H8.01M7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.07989 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.07989 20 7.2 20Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>

    <PaperCanvas key={key}
                 sketch={selectedSketch.sketch}
                 reset={selectedSketch.reset}
                 animate={selectedSketch.animation}
                 debug={debug}
                 />

    <div class="footer">
        <div class="debug-container">
            <label for="debug">draw debug lines</label>
            <input type="checkbox" id="debug" name="debug" on:change={handleDebug} bind:checked={debug}/>
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
        border: none;
        background-color: transparent;
        cursor: pointer;
        padding: 10px;
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
        /*fill: #000;*/
        width: 50px;
        height: 50px;
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