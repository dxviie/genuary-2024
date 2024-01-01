<script>
    import PaperCanvas from "$lib/components/PaperCanvas.svelte";
    import {drawParticles} from "$lib/utils/genuary.2024.01.js";
</script>

<main>
    <PaperCanvas sketch={drawParticles} />
</main>