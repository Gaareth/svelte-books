<script>
  import Img from "@zerodevx/svelte-img";

  const src = {
    sources: {
      jpeg: [
        "https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=1 128w",
        "https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=2 300w",
        "https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=3 575w",
        "https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=4 800w",
        "https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=6 1200w",
      ].join(", "),
    },
    img: {
      src: "https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1",
    },
  };
</script>

<Img
  class="lg:group-hover:opacity-50 transition-all duration-300 relative bg-background-elevated text-transparent w-[133px] h-[199px] md:rounded-[8px] sm:w-[220px] sm:h-[330px] aspect-[1/1.5] object-cover object-center rounded"
  {src}
  sizes="(width <= 1024px) 800px, 128px"
  alt="Very meow" />

<!-- <img
  src="https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1"
  alt="Very meow"
  class="lg:group-hover:opacity-50 transition-all duration-300 relative bg-background-elevated text-transparent w-[133px] h-[199px] md:rounded-[8px] sm:w-[220px] sm:h-[330px] aspect-[1/1.5] object-cover object-center rounded"
  sizes="(width <= 1024px) 800px, 128px"
  srcset="https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=1 128w,
          https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=2 300w,
          https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=3 575w,
          https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=4 800w,
          https://books.google.com/books/content?id=6P_jN6zUuMcC&printsec=frontcover&img=1&zoom=6 1200w" /> -->
