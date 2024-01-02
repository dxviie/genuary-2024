<script>
    import PaperCanvas from "$lib/components/PaperCanvas.svelte";
    import {clearParticles, drawParticles} from "$lib/utils/genuary.2024.01.js";
    import {drawGenerativeColors, resetColors} from "$lib/utils/genuary.2024.02.js";

    let key = 0;
    let debug = false;
    let sketches = [
        {name: "00. Select prompt.", sketch: () => {}, reset: () => {}},
        {name: "01. Particles. Lots of them.", sketch: drawParticles, reset: clearParticles},
        {name: "02. No palettes.", sketch: drawGenerativeColors, reset: resetColors}
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

</script>

<main>

    <h1><a href="https://genuary.art" target="_blank">Genuary 2024</a></h1>
    <h2>entries by <a href="https://d17e.dev" target="_self">d17e.dev</a></h2>
    <div class="header">

        <select on:change={handleSelectSketch}>
            {#each sketches as sketch, index}
                <option value={index}>
                    {sketch.name}
                </option>
            {/each}
        </select>
    </div>

    <PaperCanvas key={key} sketch={selectedSketch.sketch} reset={selectedSketch.reset} debug={debug}/>

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