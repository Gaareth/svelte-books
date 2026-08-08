<!-- <script lang="ts">

    import Img from "@zerodevx/svelte-img";
    interface Props {
        bookId: string;
        [key: string]: any
    }

    let { bookId, ...rest }: Props = $props();

    const src = {
        sources: {
            jpeg: [
                `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=1 128w`,
                `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=2 300w`,
                `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=3 575w`,
                `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=4 800w`,
                `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=5 1200w`,
            ].join(", "),
        },
        img: {
            src: `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1`,
        },
    };
</script>

<Img {src} {...rest} /> -->
