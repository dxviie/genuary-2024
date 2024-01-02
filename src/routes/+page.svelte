<script>
    import PaperCanvas from "$lib/components/PaperCanvas.svelte";
    import {clearParticles, drawParticles} from "$lib/utils/genuary.2024.01.js";
    import {drawGenerativeColors} from "$lib/utils/genuary.2024.02.js";

    let key = 0;
    let sketches = [
        {name: "01. Particles. Lots of them.", sketch: drawParticles, reset: clearParticles},
        {name: "02. No palettes.", sketch: drawGenerativeColors}
    ];

    let selectedSketch = sketches[0];

    function handleSelectSketch(event) {
        selectedSketch = sketches[event.target.value];
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

    <PaperCanvas key={key} sketch={selectedSketch.sketch} reset={selectedSketch.reset} debug={false}/>
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
        font-family: "Courier New", Courier, monospace;
        margin-bottom: 1rem;
    }

    h2 {
        font-size: 1rem;
        font-family: "Courier New", Courier, monospace;
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
        font-family: "Courier New", Courier, monospace;
    }

    select {
        width: 100%;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgba(0, 0, 0, 1);
        padding: 0.8rem;
        font-size: 1rem;
        font-family: "Courier New", Courier, monospace;
        border-radius: .5rem;
        border-style: dashed;
    }
</style>