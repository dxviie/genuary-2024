<script>
    import { onMount } from 'svelte';
    import paper from 'paper';

    export let sketch;
    export let debug = false;
    let canvas;

    onMount(() => {
        paper.setup(canvas);

        if (sketch && typeof sketch === 'function') {
            paper.view.onFrame = (event) => {
                sketch(paper, event, debug);
            }
        } else {
            console.error('Draw function not provided or not a function');
        }


    });
</script>

<div class="canvas-container">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    canvas {
        border: 1px solid #ccc;
        width: 80vmin;
        aspect-ratio: 1;
    }

    .canvas-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh; /* Adjust height as needed */
    }

</style>
